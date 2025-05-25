package com.paytool.repository;

import com.paytool.model.Group;
import com.paytool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByLeader(User leader);
    Optional<Group> findByQrCode(String qrCode);
} 