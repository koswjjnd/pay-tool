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
import com.paytool.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.WebSocketMessage;
import com.paytool.service.GroupPublisher;
import com.paytool.exception.CustomException;

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
    private final GroupService groupService; // 新增的 GroupService
    private final SubscriptionResolver subscriptionResolver;

    @MutationMapping
    public String testMutation() {
        return "Mutation test successful!";
    }

    @MutationMapping
    public User createUser(@Argument("input") CreateUserInput input) {
        if (userRepository.existsByUsername(input.getUsername()) || 
            userRepository.existsByEmail(input.getEmail())) {
                throw new CustomException("Username or email already exists");
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
            .orElseThrow(() -> new CustomException("User not found"));

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
                throw new CustomException("Leader ID cannot be null");
            }
            double splitAmount = input.getTotalAmount() / input.getTotalPeople();
            User leader = userRepository.findById(input.getLeaderId())
                .orElseThrow(() -> new CustomException("Leader not found with ID: " + input.getLeaderId()));
            System.out.println("Found leader: " + leader.getUsername());

            Group group = new Group();
            group.setLeader(leader);
            group.setTotalAmount(input.getTotalAmount());
            group.setDescription(input.getDescription());
            group.setStatus(GroupStatus.PENDING);
            group.setQrCode(UUID.randomUUID().toString());
            group.setTotalPeople(input.getTotalPeople());

            Group savedGroup = groupRepository.save(group);
            System.out.println("Created group with id: " + savedGroup.getId());

            
            GroupMember leaderMember = new GroupMember();
            leaderMember.setGroup(savedGroup);
            leaderMember.setUser(leader);
            leaderMember.setAmount(splitAmount);
            leaderMember.setStatus(MemberStatus.AGREED);

            GroupMember savedMember = groupMemberRepository.save(leaderMember);
            System.out.println("Created leader member with id: " + savedMember.getId());

            return savedGroup;
        } catch (Exception e) {
            System.err.println("Error in createGroup: " + e.getMessage());
            e.printStackTrace();
            throw new CustomException("Failed to create group: " + e.getMessage());
        }
    }

    @MutationMapping
    public GroupMember joinGroup(@Argument("groupId") Long groupId, @Argument("userId") Long userId) {
        return groupService.joinGroup(groupId, userId);
    }

    @MutationMapping
    public GroupMember updateMemberStatus(
            @Argument("groupId") Long groupId,
            @Argument("userId") Long userId,
            @Argument("status") MemberStatus status) {
        // 使用 GroupService 中的方法，确保推送事件逻辑
        return groupService.updateMemberStatus(groupId, userId, status);
    }

    @MutationMapping
    public Group updateGroupStatus(
            @Argument("groupId") Long groupId,
            @Argument("status") GroupStatus status) {
        return groupService.updateGroupStatus(groupId, status);
    }

    @MutationMapping
    public PaymentCard generatePaymentCard(@Argument("groupId") Long groupId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new CustomException("Group not found"));

        List<GroupMember> members = groupMemberRepository.findByGroup(group);

        // ✅ 先检查人数是否匹配
        if (members.size() != group.getTotalPeople()) {
            throw new CustomException("Not enough members to generate payment card. Expected " 
                + group.getTotalPeople() + ", but got " + members.size());
        }

        // ✅ 检查所有人是否同意
        boolean allAgreed = members.stream()
            .allMatch(member -> member.getStatus() == MemberStatus.AGREED);

        if (!allAgreed) {
            throw new CustomException("Not all members have agreed to the payment");
        }

        // 🟩 符合条件，生成卡片
        PaymentCard card = new PaymentCard();
        card.setGroup(group);
        card.setCardNumber(generateCardNumber());
        card.setAmount(group.getTotalAmount());
        card.setStatus(PaymentCardStatus.ACTIVE);
        // 生成卡后更新群组状态为已完成Add commentMore actions
        group.setStatus(GroupStatus.COMPLETED);
        Group updatedGroup = groupRepository.save(group);

        // 发布群组状态更新事件
        subscriptionResolver.publishGroupUpdate(groupId.toString(), updatedGroup);
        return paymentCardRepository.save(card);
    }


    @MutationMapping
    public Transaction createTransaction(@Argument("input") CreateTransactionInput input) {
        User sender = userRepository.findById(Long.parseLong(input.getSenderId().toString()))
            .orElseThrow(() -> new CustomException("Sender not found"));
        User receiver = userRepository.findById(Long.parseLong(input.getReceiverId().toString()))
            .orElseThrow(() -> new CustomException("Receiver not found"));

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
            .orElseThrow(() -> new CustomException("Transaction not found"));

        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }

    @MutationMapping
    public AuthPayload login(@Argument String username, @Argument String password) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new CustomException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CustomException("Invalid password");
        }
        String token = "mock-jwt-token-" + user.getId();
        return new AuthPayload(token, user);
    }

    private String generateCardNumber() {
        return String.format("%016d", System.nanoTime() % 10000000000000000L);
    }
}
