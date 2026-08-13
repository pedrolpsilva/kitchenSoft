'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ref, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

/* ─── Email Confirmation ─── KDS PedroLPS ────────────────────────── */

type ConfirmationStatus = 'loading' | 'success' | 'error';

function ConfirmarEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus('error');
        setMessage('Token de confirmação não encontrado.');
        return;
      }

      try {
        // Search for the pending confirmation with matching token
        const confirmationsRef = ref(database, 'pendingConfirmations');
        const snapshot = await get(confirmationsRef);

        if (!snapshot.exists()) {
          setStatus('error');
          setMessage('Token inválido ou expirado.');
          return;
        }

        let foundUid: string | null = null;

        snapshot.forEach((child) => {
          const data = child.val();
          if (data.token === token) {
            foundUid = child.key;
          }
        });

        if (!foundUid) {
          setStatus('error');
          setMessage('Token inválido ou expirado.');
          return;
        }

        // Mark as verified
        const userRef = ref(database, `pendingConfirmations/${foundUid}`);
        await update(userRef, { emailVerified: true, verifiedAt: Date.now() });

        // Also store the verified status in a user profile node
        const profileRef = ref(database, `users/${foundUid}`);
        await update(profileRef, { emailVerified: true });

        setStatus('success');
        setMessage('Seu email foi confirmado com sucesso!');
      } catch (error) {
        console.error('[ConfirmarEmail] Erro ao verificar token:', error);
        setStatus('error');
        setMessage('Erro ao confirmar email. Tente novamente.');
      }
    }

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-zinc-100 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />
      <div className="w-full max-w-md">
        <div className="bg-zinc-800 p-8 rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] border border-zinc-700 flex flex-col items-center text-center">

          {/* Loading */}
          {status === 'loading' && (
            <>
              <div className="mb-6 mt-4">
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mb-2">
                Verificando...
              </h1>
              <p className="text-zinc-400 text-sm">
                Confirmando seu email, aguarde um momento.
              </p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="mb-6 mt-4 animate-scale-in">
                <CheckCircle className="w-20 h-20 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                Email Confirmado!
              </h1>
              <p className="text-zinc-400 text-sm mb-8">
                {message}
              </p>
              <button
                onClick={() => router.push('/')}
                className="
                  w-full h-14 bg-emerald-500 rounded-md
                  font-sans font-bold text-lg text-black
                  select-none transition-all duration-75
                  active:scale-[0.97] active:opacity-80
                  flex items-center justify-center gap-2
                "
              >
                IR PARA O LOGIN
              </button>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="mb-6 mt-4 animate-scale-in">
                <XCircle className="w-20 h-20 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                Erro na Confirmação
              </h1>
              <p className="text-zinc-400 text-sm mb-8">
                {message}
              </p>
              <button
                onClick={() => router.push('/')}
                className="
                  w-full h-14 bg-zinc-900 border border-zinc-700 rounded-md
                  font-sans font-bold text-base text-gray-50
                  select-none transition-all duration-75
                  hover:bg-zinc-700 active:scale-[0.97]
                  flex items-center justify-center gap-2
                "
              >
                <ArrowLeft size={18} />
                VOLTAR AO LOGIN
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    }>
      <ConfirmarEmailContent />
    </Suspense>
  );
}
