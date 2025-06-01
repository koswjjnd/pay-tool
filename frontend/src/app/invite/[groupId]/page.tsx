"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";  // 改为使用 useParams
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserIcon } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const { groupId } = useParams() as { groupId: string };  // 从 useParams 解包
  const { userId } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState<any>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. 首次进来如果没有 groupId，就跳回 Dashboard
  useEffect(() => {
    if (!groupId) {
      router.push("/dashboard");
      return;
    }
    // 获取群组信息
    fetchGroupInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. 当 userId 与 groupInfo 都拿到且不在 loading 时，自动处理加入
  useEffect(() => {
    if (userId && groupInfo && !loading) {
      handleAutoJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, groupInfo, loading]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. fetchGroupInfo：向后端拉取该群组的详细信息
  const fetchGroupInfo = async () => {
    setLoading(true);
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
      } else {
        toast.error("Group not found");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch group info:", error);
      toast.error("Failed to load group information");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. handleAutoJoin：当用户已经登录并拿到 groupInfo 后，
  //    如果用户已在成员列表里，就提示并跳回 Dashboard；
  //    否则跳转到 join 页面让用户输入金额
  const handleAutoJoin = async () => {
    if (!groupInfo) return;

    // 检查是否已经是成员
    const isMember = groupInfo.members.some((m: any) => m.user.id === userId);
    if (isMember) {
      toast.info("You're already a member of this group");
      router.push(`/dashboard?groupId=${groupId}`);
    } else {
      // 不是成员，跳转到 join 页面让用户输入金额
      router.push(`/dashboard/join?groupId=${groupId}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. handleLoginClick：如果用户未登录，点击后先跳到登录页
  //    并通过 query string 带上 redirect 参数
  const handleLoginClick = () => {
    router.push(`/login?redirect=/invite/${groupId}`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. 渲染 Loading 状态（正在 fetchGroupInfo 或者正在 handleAutoJoin）
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Loading group information...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. 如果没拿到 groupInfo，就返回 null（fetchGroupInfo 中已处理重定向）
  if (!groupInfo) {
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. 如果用户未登录，则渲染“群组信息 + Login 按钮”界面
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-600">PayTool</h1>
            <p className="text-gray-600 mt-2">Group Payment Invitation</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              You're invited to join:
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Group</span>
                <span className="font-semibold">
                  {groupInfo.description || `Group #${groupInfo.id}`}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Leader</span>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">
                    {groupInfo.leader.name || groupInfo.leader.username}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-primary-600">
                  ${groupInfo.totalAmount}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Members</span>
                <span className="font-semibold">
                  {groupInfo.totalPeople} people
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleLoginClick}>
              Login to Join Group
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?
              <a
                href="/register"
                className="text-primary-600 hover:underline ml-1"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. 如果用户已登录并且已触发 handleAutoJoin，页面会快速重定向
  //    这里仅渲染一个“Processing”提示，实际用户不会看到太久
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">
          Processing your request...
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Redirecting you to the group...</p>
      </div>
    </div>
  );
}
