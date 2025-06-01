import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserState {
  token: string | null
  userId: string | null
  username: string | null
  avatar: string | null
  setUser: (user: { token: string; userId: string; username: string; avatar?: string }) => void
  clearUser: () => void
  setAvatar: (avatar: string) => void
}

// 获取或创建固定的标签页ID
const getTabId = () => {
  let tabId = sessionStorage.getItem('tab-id');
  if (!tabId) {
    tabId = Math.random().toString(36).substring(7);
    sessionStorage.setItem('tab-id', tabId);
  }
  return tabId;
};

// 创建一个自定义的存储对象
const customStorage = {
  getItem: (name: string) => {
    const tabId = getTabId();
    const value = sessionStorage.getItem(`${name}-${tabId}`);
    return value;
  },
  setItem: (name: string, value: string) => {
    const tabId = getTabId();
    sessionStorage.setItem(`${name}-${tabId}`, value);
  },
  removeItem: (name: string) => {
    const tabId = getTabId();
    sessionStorage.removeItem(`${name}-${tabId}`);
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      username: null,
      avatar: null,
      setUser: (user) => {
        console.log('Setting user state:', user);
        set({
          token: user.token,
          userId: user.userId,
          username: user.username,
          avatar: user.avatar || null
        });
      },
      clearUser: () => {
        console.log('Clearing user state');
        set({
          token: null,
          userId: null,
          username: null,
          avatar: null
        });
      },
      setAvatar: (avatar) => {
        console.log('Setting avatar:', avatar);
        set({ avatar });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated state:', state);
      },
    }
  )
) 