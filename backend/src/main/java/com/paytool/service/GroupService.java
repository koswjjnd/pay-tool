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
    public Group joinGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getStatus() != GroupStatus.PENDING && group.getStatus() != GroupStatus.ACTIVE) {
            throw new RuntimeException("Group is not available for joining");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMember availableSlot = group.getMembers().stream()
                .filter(member -> member.getUser() == null)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No available slots in the group"));

        availableSlot.setUser(user);
        availableSlot.setStatus(MemberStatus.PENDING);
        groupMemberRepository.save(availableSlot);

        groupPublisher.publishMemberStatus(groupId, availableSlot);
        return group;
    }

    @Transactional
    public GroupMember updateMemberStatus(Long groupId, Long userId, MemberStatus status) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.setStatus(status);
        member = groupMemberRepository.save(member);

        groupPublisher.publishMemberStatus(groupId, member);
        return member;
    }

    @Transactional
    public Group updateGroupStatus(Long groupId, GroupStatus status) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setStatus(status);
        group = groupRepository.save(group);

        groupPublisher.publishGroupStatus(groupId, group);
        return group;
    }
} 