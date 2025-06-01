"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LinkIcon, UserIcon } from "lucide-react";
import { useUserStore } from '@/store/userStore';

export default function JoinGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [amount, setAmount] = useState("");
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const groupId = searchParams.get("groupId");
  const { userId } = useUserStore();

  useEffect(() => {
    if (groupId && !hasJoined) {
      if (!userId) {
        sessionStorage.setItem("pendingJoinUrl", window.location.pathname + window.location.search);
        router.push("/login");
        return;
      }
      fetchGroupInfo(groupId);
    }
  }, [groupId, hasJoined, userId]);

  useEffect(() => {

    const pendingUrl = sessionStorage.getItem("pendingJoinUrl");
    if (pendingUrl && userId && !hasJoined) {
      sessionStorage.removeItem("pendingJoinUrl");
      router.replace(pendingUrl);
    }
  }, [userId, hasJoined, router]);

  const fetchGroupInfo = async (groupId: string) => {
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query Group($id: ID!) {
            group(id: $id) {
              id
              description
              totalAmount
              totalPeople
              status
              leader {
                id
                name
                username
              }
              members {
                user {
                  id
                }
              }
            }
          }`,
          variables: { id: groupId },
        }),
      });

      const data = await response.json();
      if (data.data?.group) {
        setGroupInfo(data.data.group);
        
        const isMember = data.data.group.members.some((m: any) => m.user.id === userId);
        if (isMember) {
          toast.info("You're already a member of this group");
          router.push(`/dashboard?groupId=${groupId}`);
        }
      } else {
        toast.error("Group not found");
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch group info:', error);
      toast.error("Failed to load group information");
    }
  };

  const handleJoinWithGroupId = async (groupId: string, joinAmount?: string) => {
    setLoading(true);
    try {
      if (!userId) {
        toast.error("Please login first");
        return;
      }

      const finalAmount = joinAmount || amount;
      if (!finalAmount || parseFloat(finalAmount) <= 0) {
        toast.error("Please enter a valid amount");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation JoinGroup($groupId: ID!, $amount: Float!) {
            joinGroup(groupId: $groupId, amount: $amount) {
              id
              status
            }
          }`,
          variables: {
            groupId: groupId,
            amount: parseFloat(finalAmount),
          },
        }),
      });

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      toast.success("Successfully joined the group!");
      router.push(`/dashboard?groupId=${groupId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join the group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteLink) {
      toast.error("Please enter the invite link");
      return;
    }

    try {
      const url = new URL(inviteLink);
      let groupIdFromLink = null;
      
      if (url.pathname.startsWith('/invite/')) {
        groupIdFromLink = url.pathname.split('/invite/')[1];
      } else {

        groupIdFromLink = url.searchParams.get("groupId");
      }
      
      if (!groupIdFromLink) {
        toast.error("Invalid invite link");
        return;
      }

  
      await fetchGroupInfo(groupIdFromLink);
      setHasJoined(true);
    } catch (error) {
      toast.error("Invalid invite link format");
    }
  };


  if (groupInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Join Group</h1>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Group Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Group:</span>
                <span className="font-medium">{groupInfo.description || `Group #${groupInfo.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leader:</span>
                <span className="font-medium">{groupInfo.leader.name || groupInfo.leader.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-primary-600">${groupInfo.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Members:</span>
                <span className="font-medium">{groupInfo.totalPeople} people</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Share Amount
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter your amount"
                step="0.01"
                min="0"
              />
              <p className="mt-1 text-sm text-gray-500">
                Average per person: ${(groupInfo.totalAmount / groupInfo.totalPeople).toFixed(2)}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() => handleJoinWithGroupId(groupInfo.id)}
              disabled={loading || !amount}
            >
              {loading ? "Joining..." : "Join Group"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Join Group</h1>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p>Loading group information...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    placeholder="Paste the invite link here"
                    className="pl-10"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Please paste the invite link shared by the group leader
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? "Processing..." : "Continue"}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}