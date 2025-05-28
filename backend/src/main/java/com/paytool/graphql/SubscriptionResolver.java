package com.paytool.graphql;

//     @SubscriptionMapping
//     public Publisher<GroupMember> memberStatusChanged(String groupId) {
//         System.out.println("订阅建立: " + groupId);
//         return Flux.create(sink -> {
//             memberSinks.computeIfAbsent(groupId, k -> new ArrayList<>()).add(sink);
//             sink.onCancel(() -> memberSinks.getOrDefault(groupId, new ArrayList<>()).remove(sink));
//         }, FluxSink.OverflowStrategy.BUFFER);
//     }

//     // Methods to publish updates
//     public void publishGroupUpdate(String groupId, Group group) {
//         List<FluxSink<Group>> sinks = groupSinks.get(groupId);
//         if (sinks != null) {
//             for (FluxSink<Group> sink : sinks) {
//                 sink.next(group);
//             }
//         }
//     }

//     public void publishMemberUpdate(String groupId, GroupMember member) {
//         System.out.println("推送事件: " + groupId + " memberId: " + member.getId());
//         List<FluxSink<GroupMember>> sinks = memberSinks.get(groupId);
//         if (sinks != null) {
//             for (FluxSink<GroupMember> sink : sinks) {
//                 sink.next(member);
//             }
//         }
//     }
// } 

import com.paytool.model.Group;
import com.paytool.model.GroupMember;
import com.paytool.service.GroupPublisher;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import reactor.core.publisher.Flux;
import org.reactivestreams.Publisher;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.graphql.data.method.annotation.Argument;
import java.time.Duration;

@Controller
public class SubscriptionResolver {
    private final GroupPublisher groupPublisher;

    public SubscriptionResolver(GroupPublisher groupPublisher) {
        this.groupPublisher = groupPublisher;
    }

    @SubscriptionMapping("groupStatusChanged")
    public Flux<Group> groupStatusChanged(@Argument("groupId") String groupId) {
        System.out.println("Group subscription established for groupId: " + groupId);
        return groupPublisher
            .getGroupStatusFlux(groupId)
            .doOnNext(g -> System.out.println("Emitting group update: " + g))
            .doOnCancel(() -> System.out.println("Group subscription cancelled for " + groupId));
    }

    @SubscriptionMapping("memberStatusChanged")
    public Flux<GroupMember> memberStatusChanged(@Argument("groupId") String groupId) {
        System.out.println("Member subscription established for groupId: " + groupId);
        return groupPublisher
            .getMemberStatusFlux(groupId)
            .doOnNext(m -> System.out.println("Emitting member update: " + m))
            .doOnCancel(() -> System.out.println("Member subscription cancelled for " + groupId));
    }

    public void publishGroupUpdate(String groupId, Group group) {
        groupPublisher.publishGroupStatus(groupId, group);
    }

    public void publishMemberUpdate(String groupId, GroupMember member) {
        groupPublisher.publishMemberStatus(groupId, member);
    }
} 