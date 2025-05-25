"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LinkIcon } from "lucide-react";

export default function JoinGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const groupId = searchParams.get("groupId");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (groupId && !hasJoined) {
      if (!userId) {
        localStorage.setItem("pendingJoinUrl", window.location.pathname + window.location.search);
        router.push("/login");
        return;
      }
      setHasJoined(true);
      handleJoinWithGroupId(groupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, hasJoined]);

  useEffect(() => {
    // 登录后自动跳回并自动加群
    const pendingUrl = localStorage.getItem("pendingJoinUrl");
    const userId = localStorage.getItem("userId");
    if (pendingUrl && userId && !hasJoined) {
      localStorage.removeItem("pendingJoinUrl");
      router.replace(pendingUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoinWithGroupId = async (groupId: string) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation JoinGroup($groupId: ID!, $userId: ID!) {
            joinGroup(groupId: $groupId, userId: $userId) {
              id
            }
          }`,
          variables: {
            groupId: groupId,
            userId: userId,
          },
        }),
      });

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      toast.success("Successfully joined the group!");
      window.location.href = "/dashboard";
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

    // Extract group ID from the link
    const url = new URL(inviteLink);
    const groupIdFromLink = url.searchParams.get("groupId");
    
    if (!groupIdFromLink) {
      toast.error("Invalid invite link");
      return;
    }

    await handleJoinWithGroupId(groupIdFromLink);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Join Group</h1>
        <div className="space-y-4">
          {(loading || groupId) ? (
            <div className="text-center py-4">Joining group...</div>
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
                {loading ? "Joining..." : "Join Group"}
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