'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Mail, Loader2 } from 'lucide-react';

function SucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'seu email';

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
          
          <div className="mb-6 mt-4 animate-scale-in">
            <CheckCircle className="w-20 h-20 text-emerald-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Conta criada com sucesso!</h1>
          
          <div className="bg-zinc-900 border border-zinc-700 rounded-md p-4 mb-8 w-full">
            <div className="flex items-center justify-center mb-2">
              <Mail className="w-5 h-5 text-zinc-400 mr-2" />
              <p className="text-sm font-medium text-zinc-300">Confirme seu email</p>
            </div>
            <p className="text-zinc-400 text-sm">
              Enviamos um email de confirmação para <span className="text-white font-medium">{email}</span>. Verifique sua caixa de entrada para ativar sua conta.
            </p>
          </div>
          
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
            <ArrowLeft className="w-5 h-5" />
            VOLTAR AO LOGIN
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default function CadastroSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    }>
      <SucessoContent />
    </Suspense>
  );
}
