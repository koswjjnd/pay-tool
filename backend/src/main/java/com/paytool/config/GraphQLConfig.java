package com.paytool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.TypeRuntimeWiring;

@Configuration
public class GraphQLConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
            .type(TypeRuntimeWiring.newTypeWiring("Subscription")
                .dataFetcher("groupStatusChanged", env -> {
                    String groupId = env.getArgument("groupId");
                    return null; // This will be handled by the SubscriptionResolver
                })
                .dataFetcher("memberStatusChanged", env -> {
                    String groupId = env.getArgument("groupId");
                    return null; // This will be handled by the SubscriptionResolver
                })
            );
    }
} 