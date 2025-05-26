package com.paytool.repository;

import com.paytool.model.Group;
import com.paytool.model.GroupMember;
import com.paytool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup(Group group);
    List<GroupMember> findByUser(User user);
    Optional<GroupMember> findByGroupAndUser(Group group, User user);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
} 