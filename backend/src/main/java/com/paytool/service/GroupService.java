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
    public GroupMember joinGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getStatus() != GroupStatus.PENDING && group.getStatus() != GroupStatus.ACTIVE) {
            throw new RuntimeException("Group is not available for joining");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 检查该用户是否已在组内
        boolean alreadyInGroup = group.getMembers().stream()
                .anyMatch(member -> member.getUser() != null && member.getUser().getId().equals(userId));
        if (alreadyInGroup) {
            throw new RuntimeException("User already in the group");
        }

        // 统计现有成员数
        long currentMemberCount = group.getMembers().stream()
                .filter(member -> member.getUser() != null)
                .count();
        if (currentMemberCount >= group.getTotalPeople()) {
            throw new RuntimeException("No available slots in the group");
        }

        // 新建成员
        GroupMember newMember = new GroupMember();
        newMember.setGroup(group);
        newMember.setUser(user);
        newMember.setStatus(MemberStatus.PENDING);
        newMember.setAmount(0.0); // 可根据业务逻辑分配金额
        groupMemberRepository.save(newMember);

        groupPublisher.publishMemberStatus(groupId.toString(), newMember);
        return newMember;
    }

    @Transactional
    public GroupMember updateMemberStatus(Long groupId, Long userId, MemberStatus status) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.setStatus(status);
        member = groupMemberRepository.save(member);

        groupPublisher.publishMemberStatus(groupId.toString(), member);
        return member;
    }

    @Transactional
    public Group updateGroupStatus(Long groupId, GroupStatus status) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setStatus(status);
        Group updatedGroup = groupRepository.save(group);

        groupPublisher.publishGroupStatus(groupId.toString(), updatedGroup);
        return updatedGroup;
    }
} 