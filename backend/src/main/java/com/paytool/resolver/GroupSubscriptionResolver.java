package com.paytool.resolver;

import com.paytool.model.Group;
import com.paytool.model.GroupMember;
import com.paytool.service.GroupPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;

@Component
@RequiredArgsConstructor
public class GroupSubscriptionResolver {
    private final GroupPublisher groupPublisher;

    @SubscriptionMapping
    public Flux<Group> groupStatusChanged(Long groupId) {
        return groupPublisher.getGroupStatusFlux(groupId);
    }

    @SubscriptionMapping
    public Flux<GroupMember> memberStatusChanged(Long groupId) {
        return groupPublisher.getMemberStatusFlux(groupId);
    }
} 