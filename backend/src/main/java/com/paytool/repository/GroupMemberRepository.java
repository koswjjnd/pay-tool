package com.paytool.repository;

import com.paytool.model.Group;
import com.paytool.model.GroupMember;
import com.paytool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup(Group group);
    List<GroupMember> findByUser(User user);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    boolean existsByGroupAndUser(Group group, User user);
} 