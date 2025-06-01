package com.paytool.service;

import com.paytool.model.Group;
import com.paytool.model.GroupMember;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GroupPublisher {
    private final Map<String, Sinks.Many<Group>> groupSinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<GroupMember>> memberSinks = new ConcurrentHashMap<>();

    public Flux<Group> getGroupStatusFlux(String groupId) {
        System.out.println("Creating group flux for groupId: " + groupId);
        return getOrCreateGroupSink(groupId).asFlux()
            .doOnSubscribe(s -> System.out.println("Group subscription started for: " + groupId))
            .doOnNext(g -> System.out.println("Group update emitted for: " + groupId + ", status: " + g.getStatus()))
            .doOnError(e -> System.err.println("Error in group flux for " + groupId + ": " + e.getMessage()))
            .doOnComplete(() -> System.out.println("Group subscription completed for: " + groupId));
    }

    public Flux<GroupMember> getMemberStatusFlux(String groupId) {
        System.out.println("Creating member flux for groupId: " + groupId);
        return getOrCreateMemberSink(groupId).asFlux()
            .doOnSubscribe(s -> System.out.println("Member subscription started for: " + groupId))
            .doOnNext(m -> System.out.println("Member update emitted for: " + groupId + ", member: " + m.getId()))
            .doOnError(e -> System.err.println("Error in member flux for " + groupId + ": " + e.getMessage()))
            .doOnComplete(() -> System.out.println("Member subscription completed for: " + groupId));
    }

    public void publishGroupStatus(String groupId, Group group) {
        System.out.println("Publishing group status for groupId: " + groupId + ", status: " + group.getStatus());
        Sinks.Many<Group> sink = getOrCreateGroupSink(groupId);
        Sinks.EmitResult result = sink.tryEmitNext(group);
        if (result.isFailure()) {
            System.err.println("Failed to emit group update for " + groupId + ": " + result);
        } else {
            System.out.println("Successfully emitted group update for " + groupId);
        }
    }

    public void publishMemberStatus(String groupId, GroupMember member) {
        System.out.println("Publishing member status for groupId: " + groupId + ", member: " + member.getId());
        Sinks.Many<GroupMember> sink = getOrCreateMemberSink(groupId);
        Sinks.EmitResult result = sink.tryEmitNext(member);
        if (result.isFailure()) {
            System.err.println("Failed to emit member update for " + groupId + ": " + result);
        } else {
            System.out.println("Successfully emitted member update for " + groupId);
        }
    }

    private Sinks.Many<Group> getOrCreateGroupSink(String groupId) {
        return groupSinks.computeIfAbsent(groupId, k -> {
            System.out.println("Creating new group sink for groupId: " + k);
            return Sinks.many().multicast().onBackpressureBuffer();
        });
    }

    private Sinks.Many<GroupMember> getOrCreateMemberSink(String groupId) {
        return memberSinks.computeIfAbsent(groupId, k -> {
            System.out.println("Creating new member sink for groupId: " + k);
            return Sinks.many().multicast().onBackpressureBuffer();
        });
    }
} 