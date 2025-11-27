import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "list" | "grid";

export interface UserItem {
  id: string;
  username: string;
  email: string;
  profilePic:string

}

interface AppConfigState {
  viewMode: ViewMode;
  showInfoPanel: boolean;

  userList: UserItem[];

  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  toggleInfoPanel: () => void;
  openInfoPanel: () => void;
  closeInfoPanel: () => void;

  setUserList: (list: UserItem[]) => void;
  addUser: (user: UserItem) => void;
  removeUser: (userId: string) => void;
  clearUserList: () => void;
}

export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set) => ({
      viewMode: "list",
      showInfoPanel: false,
      userList: [],

      setViewMode: (mode) => set({ viewMode: mode }),
      toggleViewMode: () =>
        set((state) => ({
          viewMode: state.viewMode === "list" ? "grid" : "list",
        })),

      toggleInfoPanel: () =>
        set((state) => ({ showInfoPanel: !state.showInfoPanel })),
      openInfoPanel: () => set({ showInfoPanel: true }),
      closeInfoPanel: () => set({ showInfoPanel: false }),

      setUserList: (list) => set({ userList: list }),

      addUser: (user) =>
        set((state) => ({ userList: [...state.userList, user] })),

      removeUser: (userId) =>
        set((state) => ({
          userList: state.userList.filter((u) => u.id !== userId),
        })),

      clearUserList: () => set({ userList: [] }),
    }),
    {
      name: "app-config",
      version: 1,

      partialize: (state) => ({
        viewMode: state.viewMode,
        showInfoPanel: state.showInfoPanel,
        userList: state.userList,
      }),
    }
  )
);
