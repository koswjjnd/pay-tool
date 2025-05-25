"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { QrCodeIcon, PlusIcon, MenuIcon, UserIcon, SearchIcon, LinkIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

// 群组列表项组件
function GroupListItem({ group, selected, onClick }: any) {
  return (
    <div
      className={`cursor-pointer px-4 py-3 border-b hover:bg-primary-50 ${selected ? "bg-primary-100 font-bold" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <span>{group.description || `Group #${group.id}`}</span>
        <span className="text-xs text-gray-500">${group.totalAmount}</span>
      </div>
      <div className="text-xs text-gray-400">{group.status}</div>
    </div>
  );
}

// 群组详情组件
function GroupDetail({ group, userId, setGroup }: any) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>(group?.members || []);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);

  useEffect(() => {
    setMembers(group?.members || []);
  }, [group]);

  const handleUpdateStatus = async (status: 'AGREED' | 'DISAGREED', memberId: string) => {
    setUpdating(memberId + status);
    try {
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation UpdateMemberStatus($groupId: ID!, $userId: ID!, $status: MemberStatus!) {
            updateMemberStatus(groupId: $groupId, userId: $userId, status: $status) {
              id
              status
            }
          }`,
          variables: {
            groupId: group.id,
            userId: userId,
            status,
          },
        }),
      });

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      // 更新本地成员状态
      const updatedMembers = members.map(m => m.id === memberId ? { ...m, status } : m);
      setMembers(updatedMembers);

      // 检查是否所有成员都同意了
      const allAgreed = updatedMembers.every(m => m.status === 'AGREED');
      if (allAgreed) {
        // 更新群组状态为 ACTIVE
        const updateGroupResponse = await fetch('http://localhost:8080/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `mutation UpdateGroupStatus($groupId: ID!, $status: GroupStatus!) {
              updateGroupStatus(groupId: $groupId, status: $status) {
                id
                status
              }
            }`,
            variables: {
              groupId: group.id,
              status: 'ACTIVE',
            },
          }),
        });

        const updateGroupData = await updateGroupResponse.json();
        if (updateGroupData.errors) {
          throw new Error(updateGroupData.errors[0].message);
        }

        // 更新本地群组状态
        setGroup((prev: any) => ({ ...prev, status: 'ACTIVE' }));
        toast.success("All members agreed! Group is now active.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleGenerateCard = async () => {
    if (!group || !userId) {
      toast.error("No group selected or user not logged in");
      return;
    }
    
    setGeneratingCard(true);
    try {
      console.log("Generating card for group:", group.id);
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation GeneratePaymentCard($groupId: ID!) {
            generatePaymentCard(groupId: $groupId) {
              id
              cardNumber
              amount
              status
              createdAt
            }
          }`,
          variables: {
            groupId: group.id,
          },
        }),
      });

      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      if (!data.data?.generatePaymentCard) {
        throw new Error("No card data received");
      }

      setCardInfo(data.data.generatePaymentCard);
      toast.success("Virtual card generated successfully!");
    } catch (error: any) {
      console.error("Error generating card:", error);
      toast.error(error.message || "Failed to generate virtual card");
    } finally {
      setGeneratingCard(false);
    }
  };

  if (!group) return <div className="text-gray-400 text-center mt-20">Select a group to view details</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Group Info Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{group.description || `Group #${group.id}`}</h2>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            <span>Leader: {group.leader?.name || group.leader?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">${group.totalAmount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-sm ${
              group.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              group.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {group.status}
            </span>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {members?.map((member: any) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <UserIcon className="w-6 h-6" />
              </div>
              
              {/* Member Info */}
              <div className="flex-1">
                <div className="font-semibold">{member.user?.name || member.user?.username}</div>
                <div className="text-sm text-gray-500">${member.amount}</div>
                <div className={`mt-2 inline-block px-2 py-1 rounded-full text-xs ${
                  member.status === 'AGREED' ? 'bg-green-100 text-green-800' :
                  member.status === 'DISAGREED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.status}
                </div>
              </div>
            </div>

            {/* Action Buttons (only visible to current user) */}
            {String(member.user?.id) === String(userId) && (
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  disabled={!!updating}
                  variant={member.status === 'AGREED' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('AGREED', member.id)}
                  className="flex-1"
                >
                  {updating === member.id + 'AGREED' ? 'Agreeing...' : 'Agree'}
                </Button>
                <Button
                  size="sm"
                  disabled={!!updating}
                  variant={member.status === 'DISAGREED' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('DISAGREED', member.id)}
                  className="flex-1"
                >
                  {updating === member.id + 'DISAGREED' ? 'Disagreeing...' : 'Disagree'}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Virtual Card Generation (only visible to group leader) */}
      {String(group.leader?.id) === String(userId) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Group Payment</h3>
          {!cardInfo ? (
            <Button
              className="w-full"
              onClick={handleGenerateCard}
              disabled={generatingCard}
            >
              {generatingCard ? "Generating..." : "Generate Virtual Card"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                <div className="text-sm mb-2">Card Number</div>
                <div className="text-xl font-mono mb-4">{cardInfo.cardNumber}</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm">Amount</div>
                    <div className="font-mono">${cardInfo.amount}</div>
                  </div>
                  <div>
                    <div className="text-sm">Status</div>
                    <div className="font-mono">{cardInfo.status}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  Created: {new Date(cardInfo.createdAt).toLocaleString()}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleGenerateCard}
                disabled={generatingCard}
              >
                {generatingCard ? "Generating..." : "Generate New Card"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId"));
      setUserName(localStorage.getItem("username") || "User");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query UserGroups($userId: ID!) {
          userGroups(userId: $userId) {
            id
            description
            totalAmount
            status
            leader { id name username }
            members { id amount status user { id name username } }
          }
        }`,
        variables: { userId },
      }),
    })
      .then(res => res.json())
      .then(data => {
        setGroups(data.data.userGroups || []);
      });
  }, [userId]);

  useEffect(() => {
    if (!selectedGroupId) return;
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query Group($id: ID!) {
          group(id: $id) {
            id
            description
            totalAmount
            status
            leader { id name username }
            members { id amount status user { id name username } }
          }
        }`,
        variables: { id: selectedGroupId },
      }),
    })
      .then(res => res.json())
      .then(data => setSelectedGroup(data.data.group));
  }, [selectedGroupId]);

  // 侧栏内容（移除账户信息）
  const DrawerContent = () => {
    const handleCopyLink = (groupId: string) => {
      const link = `${window.location.origin}/dashboard/join?groupId=${groupId}`;
      navigator.clipboard.writeText(link);
      toast.success("Invite link copied to clipboard");
    };

    return (
      <div className="flex flex-col h-full w-72 bg-white shadow-lg">
        <div className="flex items-center gap-2 p-4 border-b">
          <SearchIcon className="w-5 h-5 text-gray-400" />
          <input className="flex-1 bg-transparent outline-none text-base" placeholder="Search groups..." />
        </div>
        <div className="p-4 flex flex-col gap-2 border-b">
          <Button className="w-full flex items-center gap-2 justify-center" onClick={() => { setDrawerOpen(false); setTimeout(() => window.location.href = '/dashboard/create-group', 200); }}>
            <PlusIcon className="w-5 h-5" /> Create Group
          </Button>
          <Button className="w-full flex items-center gap-2 justify-center" variant="outline" onClick={() => { setDrawerOpen(false); setTimeout(() => window.location.href = '/dashboard/join', 200); }}>
            <LinkIcon className="w-5 h-5" /> Join by Link
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {groups.map(group => (
            <div key={group.id}>
              <GroupListItem
                group={group}
                selected={group.id === selectedGroupId}
                onClick={() => { setSelectedGroupId(group.id); setDrawerOpen(false); }}
              />
              {group.leader?.id === userId && (
                <div className="px-4 py-2 border-b bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center gap-2 justify-center text-gray-600"
                    onClick={() => handleCopyLink(group.id)}
                  >
                    <CopyIcon className="w-4 h-4" />
                    Copy Invite Link
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 右上角头像菜单
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-14 w-full flex items-center justify-center border-b bg-white relative">
        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-gray-100" onClick={() => setDrawerOpen(true)}>
          <MenuIcon className="w-6 h-6" />
        </button>
        <span className="text-2xl font-bold text-primary-600">PayTool</span>
        {/* 右上角头像 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white text-lg focus:outline-none"
            onClick={() => setAvatarMenuOpen((v) => !v)}
          >
            <UserIcon className="w-6 h-6" />
          </button>
          {avatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border">
              <div className="px-4 py-2 text-gray-700 font-semibold border-b">{userName}</div>
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      {/* 侧栏抽屉 */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/10" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50">
            <DrawerContent />
          </div>
        </>
      )}
      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto flex justify-center pt-8 md:pt-12">
        {!selectedGroupId ? (
          <div className="bg-white rounded-2xl shadow-xl px-12 py-16 flex flex-col gap-10 items-center max-w-md w-full animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-primary-700 mb-2 tracking-tight">Welcome to PayTool</h1>
              <p className="text-lg text-gray-500">Start by creating or joining a group</p>
            </div>
            <Button
              size="lg"
              className="w-64 h-16 text-xl flex items-center justify-center gap-4 rounded-full shadow-md transition-transform hover:scale-105 hover:shadow-lg bg-black text-white"
              onClick={() => window.location.href = '/dashboard/create-group'}
            >
              <PlusIcon className="w-9 h-9" /> Create Group
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-64 h-16 text-xl flex items-center justify-center gap-4 rounded-full border-2 border-primary-500 text-primary-700 bg-white transition-transform hover:scale-105 hover:bg-primary-50"
              onClick={() => window.location.href = '/dashboard/join'}
            >
              <LinkIcon className="w-9 h-9" /> Join by Link
            </Button>
          </div>
        ) : (
          <GroupDetail group={selectedGroup} userId={userId} setGroup={setSelectedGroup} />
        )}
      </main>
    </div>
  );
} 