'use client';

import { create } from 'zustand';
import { ref, get as firebaseGet, set as firebaseSet, onValue, type Unsubscribe } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { UserRole, Permissions, UserProfile } from '@/types/permissions';
import { ADMIN_PERMISSIONS, DEFAULT_OPERATOR_PERMISSIONS } from '@/types/permissions';

let activeProfileUnsubscribe: Unsubscribe | null = null;

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

  loadProfile: async (uid: string) => {
    if (activeProfileUnsubscribe) {
      activeProfileUnsubscribe();
      activeProfileUnsubscribe = null;
    }

    try {
      const profileRef = ref(database, `users/${uid}`);
      const snapshot = await firebaseGet(profileRef);

      if (!snapshot.exists()) {
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
      }

      activeProfileUnsubscribe = onValue(profileRef, (snap) => {
        if (snap.exists()) {
          const data = snap.val() as UserProfile;
          const role: UserRole = data.role === 'operator' || (Boolean(data.parentUid) && data.role !== 'admin')
            ? 'operator'
            : (data.role || 'admin');

          const permissions: Permissions = role === 'admin'
            ? ADMIN_PERMISSIONS
            : { ...DEFAULT_OPERATOR_PERMISSIONS, ...(data.permissions || {}) };

          const tenantId = data.tenantId || (role === 'admin' ? uid : null);

          set({
            tenantId,
            role,
            permissions,
            isProfileLoaded: true,
            profile: { ...data, uid, role, tenantId: tenantId || uid, permissions },
          });
        }
      });
    } catch (error) {
      console.error('[TenantStore] Erro ao carregar perfil:', error);
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
    if (activeProfileUnsubscribe) {
      activeProfileUnsubscribe();
      activeProfileUnsubscribe = null;
    }

    set({
      tenantId: null,
      role: null,
      permissions: DEFAULT_OPERATOR_PERMISSIONS,
      isProfileLoaded: false,
      profile: null,
    });
  },
}));
