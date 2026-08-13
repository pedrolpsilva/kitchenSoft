'use client';

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useTenantStore } from '@/store/useTenantStore';

/* ─── Auth Store ─── KDS PedroLPS ───────────────────────────────── */

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  displayName: string;
  email: string;
  isLoading: boolean;
  error: string | null;

  /* --- Compat aliases (consumed by TopBar, UserMenuDrawer, KDSBoard, SalaoScreen) --- */
  username: string | null;
  storedPass: string;

  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateCredentials: (newDisplayName: string, newPassword?: string) => void;
  setError: (error: string | null) => void;
  _initAuthListener: () => () => void;
}

/**
 * Translate Firebase Auth error codes to user-friendly PT-BR messages.
 */
function firebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Nenhuma conta encontrada com este email.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/invalid-credential':
      return 'Credenciais inválidas. Verifique email e senha.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    case 'auth/popup-closed-by-user':
      return 'Login cancelado.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.';
    default:
      return 'Erro ao autenticar. Tente novamente.';
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  user: null,
  displayName: '',
  email: '',
  isLoading: true,
  error: null,

  /* Compat aliases */
  username: null,
  storedPass: '',

  /* ─── Email/Password Login ─── */
  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      // Load tenant profile
      await useTenantStore.getState().loadProfile(user.uid);

      set({
        isAuthenticated: true,
        user,
        displayName: user.displayName || user.email || '',
        email: user.email || '',
        username: user.displayName || user.email || '',
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      const msg = firebaseErrorMessage(error.code);
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  /* ─── Google Popup Login ─── */
  loginWithGoogle: async (): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;

      // Load tenant profile
      await useTenantStore.getState().loadProfile(user.uid);

      set({
        isAuthenticated: true,
        user,
        displayName: user.displayName || user.email || '',
        email: user.email || '',
        username: user.displayName || user.email || '',
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      const msg = firebaseErrorMessage(error.code);
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  /* ─── Logout ─── */
  logout: async () => {
    try {
      await signOut(auth);
    } catch {
      // Silently fail
    }
    useTenantStore.getState().clearProfile();
    set({
      isAuthenticated: false,
      user: null,
      displayName: '',
      email: '',
      username: null,
      isLoading: false,
      error: null,
    });
  },

  /* ─── Update display name (compat with ChangeUserDataModal) ─── */
  updateCredentials: (newDisplayName: string, _newPassword?: string) => {
    set((state) => ({
      displayName: newDisplayName || state.displayName,
      username: newDisplayName || state.username,
    }));
  },

  setError: (error: string | null) => set({ error }),

  /* ─── Auth State Listener (call once at app root) ─── */
  _initAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Load tenant profile on auth state restore
        await useTenantStore.getState().loadProfile(user.uid);

        set({
          isAuthenticated: true,
          user,
          displayName: user.displayName || user.email || '',
          email: user.email || '',
          username: user.displayName || user.email || '',
          isLoading: false,
          error: null,
        });
      } else {
        useTenantStore.getState().clearProfile();
        set({
          isAuthenticated: false,
          user: null,
          displayName: '',
          email: '',
          username: null,
          isLoading: false,
          error: null,
        });
      }
    });
    return unsubscribe;
  },
}));
