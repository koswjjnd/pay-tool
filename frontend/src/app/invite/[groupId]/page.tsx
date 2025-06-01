"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserIcon } from "lucide-react";

export default function InvitePage({ params }: { params: { groupId: string } }) {
  const router = useRouter();
  const { userId } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const groupId = params.groupId;

  useEffect(() => {
    if (!groupId) {
      router.push('/dashboard');
      return;
    }

    // 获取群组信息
    fetchGroupInfo();
  }, [groupId]);

  useEffect(() => {
    // 如果用户已登录且群组信息已加载，自动处理加入
    if (userId && groupInfo && !loading) {
      handleAutoJoin();
    }
  }, [userId, groupInfo, loading]);

  const fetchGroupInfo = async () => {
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
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch group info:', error);
      toast.error("Failed to load group information");
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoJoin = async () => {
    // 检查是否已经是成员
    const isMember = groupInfo.members.some((m: any) => m.user.id === userId);
    
    if (isMember) {
      // 已经是成员，直接跳转到 dashboard 并选中该组
      toast.info("You're already a member of this group");
      router.push(`/dashboard?groupId=${groupId}`);
    } else {
      // 不是成员，跳转到 join 页面让用户输入金额
      // 重要：确保带上 groupId 参数
      router.push(`/dashboard/join?groupId=${groupId}`);
    }
  };

  const handleLoginClick = () => {
    // 保存当前邀请链接，登录后返回
    router.push(`/login?redirect=/invite/${groupId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading group information...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!groupInfo) {
    return null; // 已经在 fetchGroupInfo 中处理了重定向
  }

  // 如果用户未登录，显示群组信息和登录按钮
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-600">PayTool</h1>
            <p className="text-gray-600 mt-2">Group Payment Invitation</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">You're invited to join:</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Group</span>
                <span className="font-semibold">{groupInfo.description || `Group #${groupInfo.id}`}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Leader</span>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{groupInfo.leader.name || groupInfo.leader.username}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-primary-600">${groupInfo.totalAmount}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Members</span>
                <span className="font-semibold">{groupInfo.totalPeople} people</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleLoginClick}
            >
              Login to Join Group
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Don't have an account? 
              <a href="/register" className="text-primary-600 hover:underline ml-1">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 用户已登录，显示处理中
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Processing your request...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Redirecting you to the group...</p>
      </div>
    </div>
  );
}
