package com.paytool.graphql;

import com.paytool.model.Group;
import com.paytool.model.GroupMember;
import com.paytool.model.Transaction;
import com.paytool.model.User;
import com.paytool.repository.GroupMemberRepository;
import com.paytool.repository.GroupRepository;
import com.paytool.repository.TransactionRepository;
import com.paytool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class QueryResolver {
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final TransactionRepository transactionRepository;

    @QueryMapping
    public String hello() {
        return "Hello from PayTool GraphQL!";
    }

    @QueryMapping
    public User user(@Argument Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<User> users() {
        return userRepository.findAll();
    }

    @QueryMapping
    public Group group(@Argument Long id) {
        return groupRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Group> groups() {
        return groupRepository.findAll();
    }

    @QueryMapping
    public List<Group> userGroups(@Argument Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }
        List<GroupMember> memberships = groupMemberRepository.findByUser(user);
        return memberships.stream().map(GroupMember::getGroup).distinct().toList();
    }

    @QueryMapping
    public List<GroupMember> groupMembers(@Argument Long groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return List.of();
        }
        return groupMemberRepository.findByGroup(group);
    }

    @QueryMapping
    public Transaction transaction(@Argument Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Transaction> transactions() {
        return transactionRepository.findAll();
    }

    @QueryMapping
    public List<Transaction> userTransactions(@Argument Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }
        return transactionRepository.findBySenderOrReceiver(user, user);
    }
} 