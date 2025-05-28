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
        return getOrCreateGroupSink(groupId).asFlux();
    }

    public Flux<GroupMember> getMemberStatusFlux(String groupId) {
        System.out.println("Creating member flux for groupId: " + groupId);
        return getOrCreateMemberSink(groupId).asFlux();
    }

    public void publishGroupStatus(String groupId, Group group) {
        System.out.println("Publishing group status for groupId: " + groupId);
        Sinks.Many<Group> sink = groupSinks.get(groupId);
        if (sink != null) {
            sink.tryEmitNext(group);
        }
    }

    public void publishMemberStatus(String groupId, GroupMember member) {
        System.out.println("Publishing member status for groupId: " + groupId + ", member: " + member.getId());
        Sinks.Many<GroupMember> sink = memberSinks.get(groupId);
        if (sink != null) {
            System.out.println("Sink found, emitting member update");
            sink.tryEmitNext(member);
        } else{
            System.out.println("No sink found for groupId: " + groupId);
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