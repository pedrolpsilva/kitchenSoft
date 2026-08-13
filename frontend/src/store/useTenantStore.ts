'use client';

import { create } from 'zustand';
import { ref, get as firebaseGet, set as firebaseSet } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { UserRole, Permissions, UserProfile } from '@/types/permissions';
import { ADMIN_PERMISSIONS, DEFAULT_OPERATOR_PERMISSIONS } from '@/types/permissions';

/* ─── Tenant Store ─── KDS PedroLPS ─────────────────────────────── */

interface TenantState {
  tenantId: string | null;
  role: UserRole | null;
  permissions: Permissions;
  isProfileLoaded: boolean;
  profile: UserProfile | null;

  loadProfile: (uid: string) => Promise<void>;
  hasPermission: (perm: keyof Permissions) => boolean;
  clearProfile: () => void;
}

export const useTenantStore = create<TenantState>()((set, get) => ({
  tenantId: null,
  role: null,
  permissions: DEFAULT_OPERATOR_PERMISSIONS,
  isProfileLoaded: false,
  profile: null,

  /**
   * Load user profile from `/users/{uid}`.
   * If profile doesn't exist (e.g. first login after Google sign-in or legacy user),
   * auto-creates an admin profile.
   */
  loadProfile: async (uid: string) => {
    try {
      const profileRef = ref(database, `users/${uid}`);
      const snapshot = await firebaseGet(profileRef);

      if (snapshot.exists()) {
        const data = snapshot.val() as UserProfile;
        const role = data.role || 'admin';
        const permissions = role === 'admin' ? ADMIN_PERMISSIONS : (data.permissions || DEFAULT_OPERATOR_PERMISSIONS);
        const tenantId = data.tenantId || uid;

        set({
          tenantId,
          role,
          permissions,
          isProfileLoaded: true,
          profile: { ...data, uid, tenantId, permissions },
        });
      } else {
        // First-time user → auto-create admin profile
        const newProfile: UserProfile = {
          uid,
          role: 'admin',
          displayName: '',
          email: '',
          tenantId: uid,
          parentUid: null,
          permissions: ADMIN_PERMISSIONS,
          createdAt: Date.now(),
        };

        await firebaseSet(profileRef, newProfile);

        set({
          tenantId: uid,
          role: 'admin',
          permissions: ADMIN_PERMISSIONS,
          isProfileLoaded: true,
          profile: newProfile,
        });
      }
    } catch (error) {
      console.error('[TenantStore] Erro ao carregar perfil:', error);
      // Fallback: treat as admin with own uid as tenant
      set({
        tenantId: uid,
        role: 'admin',
        permissions: ADMIN_PERMISSIONS,
        isProfileLoaded: true,
        profile: null,
      });
    }
  },

  hasPermission: (perm: keyof Permissions): boolean => {
    const state = get();
    if (state.role === 'admin') return true;
    return state.permissions[perm] === true;
  },

  clearProfile: () => {
    set({
      tenantId: null,
      role: null,
      permissions: DEFAULT_OPERATOR_PERMISSIONS,
      isProfileLoaded: false,
      profile: null,
    });
  },
}));
