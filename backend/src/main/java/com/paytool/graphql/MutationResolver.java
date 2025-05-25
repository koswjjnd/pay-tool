package com.paytool.graphql;

import com.paytool.dto.CreateGroupInput;
import com.paytool.dto.CreateTransactionInput;
import com.paytool.dto.CreateUserInput;
import com.paytool.dto.UpdateUserInput;
import com.paytool.model.*;
import com.paytool.repository.GroupMemberRepository;
import com.paytool.repository.GroupRepository;
import com.paytool.repository.PaymentCardRepository;
import com.paytool.repository.TransactionRepository;
import com.paytool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class MutationResolver {
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PaymentCardRepository paymentCardRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @MutationMapping
    public String testMutation() {
        return "Mutation test successful!";
    }

    @MutationMapping
    public User createUser(@Argument("input") CreateUserInput input) {
        if (userRepository.existsByUsername(input.getUsername()) || 
            userRepository.existsByEmail(input.getEmail())) {
            throw new RuntimeException("Username or email already exists");
        }

        User user = new User();
        user.setUsername(input.getUsername());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setEmail(input.getEmail());
        user.setName(input.getName());

        return userRepository.save(user);
    }

    @MutationMapping
    public User updateUser(@Argument("id") String id, @Argument("input") UpdateUserInput input) {
        User user = userRepository.findById(Long.parseLong(id))
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (input.getEmail() != null) {
            user.setEmail(input.getEmail());
        }
        if (input.getName() != null) {
            user.setName(input.getName());
        }
        if (input.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(input.getPassword()));
        }

        return userRepository.save(user);
    }

    @MutationMapping
    public Group createGroup(@Argument("input") CreateGroupInput input) {
        try {
            System.out.println("Creating group with input: " + input);
            
            if (input.getLeaderId() == null) {
                throw new RuntimeException("Leader ID cannot be null");
            }
            
            User leader = userRepository.findById(input.getLeaderId())
                .orElseThrow(() -> new RuntimeException("Leader not found with ID: " + input.getLeaderId()));
            System.out.println("Found leader: " + leader.getUsername());

            // 创建群组
            Group group = new Group();
            group.setLeader(leader);
            group.setTotalAmount(input.getTotalAmount());
            group.setDescription(input.getDescription());
            group.setStatus(GroupStatus.PENDING);
            group.setQrCode(UUID.randomUUID().toString());
            
            // 保存群组
            Group savedGroup = groupRepository.save(group);
            System.out.println("Created group with id: " + savedGroup.getId());

            // 创建者自动成为群组成员
            GroupMember leaderMember = new GroupMember();
            leaderMember.setGroup(savedGroup);
            leaderMember.setUser(leader);
            leaderMember.setAmount(input.getTotalAmount()); // 创建者默认承担全部金额
            leaderMember.setStatus(MemberStatus.AGREED); // 创建者默认同意

            // 保存群组成员
            GroupMember savedMember = groupMemberRepository.save(leaderMember);
            System.out.println("Created leader member with id: " + savedMember.getId());

            return savedGroup;
        } catch (Exception e) {
            System.err.println("Error in createGroup: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create group: " + e.getMessage(), e);
        }
    }

    @MutationMapping
    public GroupMember joinGroup(@Argument("groupId") Long groupId, @Argument("userId") Long userId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // 检查用户是否已经是群组成员
        if (groupMemberRepository.findByGroupAndUser(group, user).isPresent()) {
            throw new RuntimeException("User already joined this group");
        }

        // 计算每个成员应付金额（可自定义分摊逻辑）
        long memberCount = groupMemberRepository.findByGroup(group).size();
        double amountPerMember = group.getTotalAmount() / (memberCount + 1);

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setAmount(amountPerMember);
        member.setStatus(MemberStatus.PENDING);

        return groupMemberRepository.save(member);
    }

    @MutationMapping
    public GroupMember updateMemberStatus(
            @Argument("groupId") Long groupId,
            @Argument("userId") Long userId,
            @Argument("status") MemberStatus status) {
        try {
            Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException(
                    String.format("Member not found for group %d and user %d", groupId, userId)));

            member.setStatus(status);
            return groupMemberRepository.save(member);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update member status: " + e.getMessage(), e);
        }
    }

    @MutationMapping
    public PaymentCard generatePaymentCard(@Argument("groupId") Long groupId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

        // 检查是否所有成员都已同意
        List<GroupMember> members = groupMemberRepository.findByGroup(group);
        boolean allAgreed = members.stream()
            .allMatch(member -> member.getStatus() == MemberStatus.AGREED);

        if (!allAgreed) {
            throw new RuntimeException("Not all members have agreed to the payment");
        }

        PaymentCard card = new PaymentCard();
        card.setGroup(group);
        card.setCardNumber(generateCardNumber());
        card.setAmount(group.getTotalAmount());
        card.setStatus(PaymentCardStatus.ACTIVE);

        return paymentCardRepository.save(card);
    }

    @MutationMapping
    public Transaction createTransaction(@Argument("input") CreateTransactionInput input) {
        User sender = userRepository.findById(Long.parseLong(input.getSenderId().toString()))
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(Long.parseLong(input.getReceiverId().toString()))
            .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Transaction transaction = new Transaction();
        transaction.setSender(sender);
        transaction.setReceiver(receiver);
        transaction.setAmount(input.getAmount());
        transaction.setDescription(input.getDescription());
        transaction.setStatus(TransactionStatus.PENDING);

        return transactionRepository.save(transaction);
    }

    @MutationMapping
    public Transaction updateTransactionStatus(
            @Argument("id") String id,
            @Argument("status") TransactionStatus status) {
        Transaction transaction = transactionRepository.findById(Long.parseLong(id))
            .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }

    @MutationMapping
    public AuthPayload login(@Argument String username, @Argument String password) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        // TODO: 替换为真实 JWT 生成逻辑
        String token = "mock-jwt-token-" + user.getId();
        return new AuthPayload(token, user);
    }

    private String generateCardNumber() {
        // 生成16位卡号
        return String.format("%016d", System.nanoTime() % 10000000000000000L);
    }
} 