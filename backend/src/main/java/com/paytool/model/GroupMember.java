package com.paytool.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "group_members")
public class GroupMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status = MemberStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime joinedAt;

    @Override
    public String toString() {
        return "GroupMember{id=" + id + ", status=" + status + ", amount=" + amount + ", groupId=" + (group != null ? group.getId() : null) + ", userId=" + (user != null ? user.getId() : null) + "}";
    }
} 