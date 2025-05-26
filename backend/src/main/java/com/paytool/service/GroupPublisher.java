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
    private final Map<Long, Sinks.Many<Group>> groupSinks = new ConcurrentHashMap<>();
    private final Map<Long, Sinks.Many<GroupMember>> memberSinks = new ConcurrentHashMap<>();

    public Flux<Group> getGroupStatusFlux(Long groupId) {
        return getOrCreateGroupSink(groupId).asFlux();
    }

    public Flux<GroupMember> getMemberStatusFlux(Long groupId) {
        return getOrCreateMemberSink(groupId).asFlux();
    }

    public void publishGroupStatus(Long groupId, Group group) {
        getOrCreateGroupSink(groupId).tryEmitNext(group);
    }

    public void publishMemberStatus(Long groupId, GroupMember member) {
        getOrCreateMemberSink(groupId).tryEmitNext(member);
    }

    private Sinks.Many<Group> getOrCreateGroupSink(Long groupId) {
        return groupSinks.computeIfAbsent(groupId, k -> Sinks.many().multicast().onBackpressureBuffer());
    }

    private Sinks.Many<GroupMember> getOrCreateMemberSink(Long groupId) {
        return memberSinks.computeIfAbsent(groupId, k -> Sinks.many().multicast().onBackpressureBuffer());
    }
} 