import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from './firebase';

const SEED_USERS = [
  { email: 'user@kitchensoft.local', password: 'user', displayName: 'Usuário' },
];

export async function seedInitialUsers(): Promise<void> {
  try {
    const seededRef = ref(database, 'system/seeded');
    const snapshot = await get(seededRef);

    if (snapshot.exists() && snapshot.val() === true) {
      return;
    }

    for (const userData of SEED_USERS) {
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        await updateProfile(credential.user, {
          displayName: userData.displayName,
        });
      } catch (error: any) {
        if (error.code !== 'auth/email-already-in-use') {
          console.error(`[Seed] Erro ao criar ${userData.email}:`, error);
        }
      }
    }

    await set(seededRef, true);
  } catch (error) {
    console.error('[Seed] Erro durante o seed:', error);
  }
}
