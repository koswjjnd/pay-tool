import { useEffect, useState } from "react";
import { Client, createClient, ExecutionResult } from "graphql-ws";

interface Group {
  id: string;
  totalAmount: number;
  totalPeople: number;
  description: string;
  status: string;
}

interface User {
  id: string;
  name: string;
}

interface GroupMember {
  id: string;
  amount: number;
  status: string;
  user: User;
}

interface SubscriptionResponse<T> {
  data: {
    groupStatusChanged?: T;
    memberStatusChanged?: T;
  } | null;
}

type GroupSubscriptionData = {
  groupStatusChanged: Group;
};

type MemberSubscriptionData = {
  memberStatusChanged: GroupMember;
};

const client = createClient({
  url: "ws://localhost:8080/graphql",
  connectionParams: {
    // Add any authentication headers or tokens if needed
  },
  retryAttempts: 5,
  connectionAckWaitTimeout: 10000, // 10 seconds
  lazy: false, // Connect immediately
  on: {
    connected: () => {
      console.log("WebSocket connected");
    },
    connecting: () => {
      console.log("WebSocket connecting");
    },
    error: (error) => {
      console.error("WebSocket error:", error);
    },
    closed: (event) => {
      console.log("WebSocket closed:", event);
    },
  },
  webSocketImpl: WebSocket,
});

export function useGroupSubscription(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return client.subscribe<GroupSubscriptionData>(
      {
        query: `
          subscription GroupStatusChanged($groupId: ID!) {
            groupStatusChanged(groupId: $groupId) {
              id
              totalAmount
              totalPeople
              description
              status
            }
          }
        `,
        variables: { groupId },
      },
      {
        next: (result: ExecutionResult<GroupSubscriptionData>) => {
          if (result.data?.groupStatusChanged) {
            setGroup(result.data.groupStatusChanged);
          }
        },
        error: (err: Error) => {
          setError(err);
        },
        complete: () => {
          console.log("Subscription completed");
        },
      }
    );
  }, [groupId]);

  return { group, error };
}

export function useMemberSubscription(groupId: string) {
  const [member, setMember] = useState<GroupMember | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return client.subscribe<MemberSubscriptionData>(
      {
        query: `
          subscription MemberStatusChanged($groupId: ID!) {
            memberStatusChanged(groupId: $groupId) {
              id
              amount
              status
              user {
                id
                name
              }
            }
          }
        `,
        variables: { groupId },
      },
      {
        next: (result: ExecutionResult<MemberSubscriptionData>) => {
          if (result.data?.memberStatusChanged) {
            setMember(result.data.memberStatusChanged);
          }
        },
        error: (err: Error) => {
          setError(err);
        },
        complete: () => {
          console.log("Subscription completed");
        },
      }
    );
  }, [groupId]);

  return { member, error };
}
