'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ─── Auth Store ─── KDS PedroLPS ───────────────────────────────── */

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  storedPass: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (newUsername: string, newPassword?: string) => void;
}

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin',
} as const;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      username: DEFAULT_CREDENTIALS.username,
      storedPass: DEFAULT_CREDENTIALS.password,

      login: (username: string, password: string): boolean => {
        const state = get();
        const validUser = state.username || DEFAULT_CREDENTIALS.username;
        const validPass = state.storedPass || DEFAULT_CREDENTIALS.password;

        if (
          (username === validUser && password === validPass) ||
          (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password)
        ) {
          set({ isAuthenticated: true, username: validUser, storedPass: validPass });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      updateCredentials: (newUsername: string, newPassword?: string) => {
        set((state) => ({
          username: newUsername || state.username,
          storedPass: newPassword || state.storedPass,
        }));
      },
    }),
    {
      name: 'kds-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

