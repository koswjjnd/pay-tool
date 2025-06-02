package com.paytool.service;

import com.paytool.model.Group;
import com.paytool.model.GroupMember;
import com.paytool.model.User;
import com.paytool.model.GroupStatus;
import com.paytool.model.MemberStatus;
import com.paytool.repository.GroupMemberRepository;
import com.paytool.repository.GroupRepository;
import com.paytool.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import com.paytool.exception.CustomException;
@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupPublisher groupPublisher;

    public GroupService(
            GroupRepository groupRepository,
            UserRepository userRepository,
            GroupMemberRepository groupMemberRepository,
            GroupPublisher groupPublisher) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupPublisher = groupPublisher;
    }

    @Transactional
    public GroupMember joinGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));

        // Check if user is already a member
        Optional<GroupMember> existingMember = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (existingMember.isPresent()) {
            throw new CustomException("User is already a member of this group");
        }

        // Calculate split amount
        double splitAmount = group.getTotalAmount() / group.getTotalPeople();

        // Create new member
        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setAmount(splitAmount);
        member.setStatus(MemberStatus.PENDING);

        // Save member
        GroupMember savedMember = groupMemberRepository.save(member);

        // Fetch updated group with all members
        Group updatedGroup = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException("Group not found"));

        // Publish group update
        groupPublisher.publishGroupStatus(groupId.toString(), updatedGroup);

        return savedMember;
    }

    @Transactional
    public GroupMember updateMemberStatus(Long groupId, Long userId, MemberStatus status) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new CustomException("Member not found"));

        member.setStatus(status);
        member = groupMemberRepository.save(member);

        groupPublisher.publishMemberStatus(groupId.toString(), member);
        return member;
    }

    @Transactional
    public Group updateGroupStatus(Long groupId, GroupStatus status) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException("Group not found"));

        group.setStatus(status);
        Group updatedGroup = groupRepository.save(group);

        groupPublisher.publishGroupStatus(groupId.toString(), updatedGroup);
        return updatedGroup;
    }
} 