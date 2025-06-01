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

interface GroupSubscriptionResponse {
  groupStatusChanged: {
    id: string;
    status: string;
    description: string;
    totalAmount: number;
    totalPeople: number;
    leader: {
      id: string;
      name: string;
      username: string;
    };
    members: Array<{
      id: string;
      amount: number;
      status: string;
      user: {
        id: string;
        name: string;
        username: string;
      };
    }>;
  };
}

interface MemberSubscriptionResponse {
  memberStatusChanged: {
    id: string;
    status: string;
    amount: number;
    user: {
      id: string;
      name: string;
      username: string;
    };
  };
}

// Create WebSocket client instance
const createWebSocketClient = () => {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  let client: Client | null = null;

  const setupClient = () => {
    // Safely get token
    const getToken = () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
      }
      return null;
    };

    client = createClient({
      url: "ws://localhost:8080/graphql",
      connectionParams: {
        authToken: getToken(),
      },
      retryAttempts: maxRetries,
      shouldRetry: (errOrCloseEvent) => {
        if (retryCount < maxRetries) {
          retryCount++;
          return true;
        }
        return false;
      },
      lazy: true,
      on: {
        connected: () => {
          console.log("WebSocket connected");
          retryCount = 0; // Reset retry count
        },
        connecting: () => {
          console.log("WebSocket connecting...");
        },
        error: (error) => {
          console.error("WebSocket error:", error);
        },
        closed: (event) => {
          console.log("WebSocket closed:", event);
          if (retryCount < maxRetries) {
            setTimeout(() => {
              console.log('Attempting to reconnect...');
              client = createWebSocketClient();
            }, retryDelay);
          }
        },
      },
      webSocketImpl: WebSocket,
    });
  };

  // Only execute setupClient on client side
  if (typeof window !== 'undefined') {
    setupClient();
  }

  if (!client) {
    throw new Error("Failed to create WebSocket client");
  }
  return client;
};

// Create WebSocket client instance only on client side
const client = typeof window !== 'undefined' ? createWebSocketClient() : null;

export const useGroupSubscription = (groupId: string) => {
  const [group, setGroup] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!groupId || !client) return;

    console.log('Setting up group subscription for:', groupId);
    const subscription = client.subscribe<GroupSubscriptionResponse>(
      {
        query: `subscription GroupStatusChanged($groupId: ID!) {
          groupStatusChanged(groupId: $groupId) {
            id
            status
            description
            totalAmount
            totalPeople
            leader { id name username }
            members { id amount status user { id name username } }
          }
        }`,
        variables: { groupId },
      },
      {
        next: (data: ExecutionResult<GroupSubscriptionResponse>) => {
          console.log('Group status update received:', data);
          if (data.data?.groupStatusChanged) {
            console.log('Updating group state with:', data.data.groupStatusChanged);
            setGroup(data.data.groupStatusChanged);
          }
        },
        error: (err: Error) => {
          console.error('Group subscription error:', err);
          setError(err);
        },
        complete: () => {
          console.log('Group subscription completed');
        },
      }
    );

    return () => {
      console.log('Cleaning up group subscription for:', groupId);
      subscription.unsubscribe();
    };
  }, [groupId]);

  return { group, error };
};

export const useMemberSubscription = (groupId: string) => {
  const [member, setMember] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!groupId || !client) return;

    const subscription = client.subscribe<MemberSubscriptionResponse>(
      {
        query: `subscription MemberStatusChanged($groupId: ID!) {
          memberStatusChanged(groupId: $groupId) {
            id
            status
            amount
            user { id name username }
          }
        }`,
        variables: { groupId },
      },
      {
        next: (data: ExecutionResult<MemberSubscriptionResponse>) => {
          console.log('Member status update received:', data);
          if (data.data?.memberStatusChanged) {
            setMember(data.data.memberStatusChanged);
          }
        },
        error: (err: Error) => {
          console.error('Member subscription error:', err);
          setError(err);
        },
        complete: () => {
          console.log('Member subscription completed');
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [groupId]);

  return { member, error };
};
