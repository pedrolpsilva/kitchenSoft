'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ChefHat, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { trackButtonClick, trackUserLoginLocation } from '@/lib/analytics';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    trackButtonClick('btn_entrar', 'login_form', { email });

    if (!email || !password) {
      setError('Preencha todos os campos.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      trackUserLoginLocation(email);
    } else {
      const storeError = useAuthStore.getState().error;
      setError(storeError || 'Credenciais inválidas. Tente novamente.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleGoogleLogin = async () => {
    trackButtonClick('btn_entrar_google', 'login_form');
    setError('');
    setIsLoading(true);
    const success = await loginWithGoogle();
    setIsLoading(false);

    if (success) {
      const userEmail = useAuthStore.getState().email;
      trackUserLoginLocation(userEmail);
    } else {
      const storeError = useAuthStore.getState().error;
      if (storeError && storeError !== 'Login cancelado.') {
        setError(storeError);
      }
    }
  };

  const handleTogglePassword = () => {
    trackButtonClick(showPassword ? 'btn_ocultar_senha' : 'btn_mostrar_senha', 'login_form');
    setShowPassword(!showPassword);
  };

  return (
    <main className="flex items-center justify-center h-screen w-screen bg-black">
      <div
        className={`
          flex flex-col items-center w-full max-w-md p-10 bg-zinc-800
          border border-zinc-700 rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)]
          transition-transform
          ${isShaking ? 'animate-shake' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-700">
            <ChefHat size={40} className="text-emerald-500" />
          </div>
          <h1 className="font-sans font-bold text-3xl text-gray-50 tracking-wide">
            PedroLPS
          </h1>
          <p className="font-sans text-sm text-zinc-400">
            Kitchen Display System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-email"
              className="font-sans text-sm font-medium text-zinc-400"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isLoading}
              className="
                h-14 px-4 bg-zinc-900 border border-zinc-700 rounded-md
                font-sans text-base text-gray-50 placeholder-zinc-600
                outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                transition-colors disabled:opacity-50
              "
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-password"
              className="font-sans text-sm font-medium text-zinc-400"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className="
                  w-full h-14 px-4 pr-12 bg-zinc-900 border border-zinc-700 rounded-md
                  font-sans text-base text-gray-50 placeholder-zinc-600
                  outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                  transition-colors disabled:opacity-50
                "
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="font-sans text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full h-16 mt-2 bg-emerald-500 rounded-md
              font-sans font-bold text-lg text-black
              select-none transition-all duration-75
              active:scale-[0.97] active:opacity-80
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              'ENTRAR'
            )}
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="font-sans text-xs text-zinc-500 uppercase">ou</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="
              w-full h-14 bg-zinc-900 border border-zinc-700 rounded-md
              font-sans font-bold text-base text-gray-50
              select-none transition-all duration-75
              hover:bg-zinc-700 active:scale-[0.97]
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-3
            "
          >
            <GoogleIcon />
            Entrar com Google
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              trackButtonClick('btn_registrar', 'login_form');
              router.push('/cadastro');
            }}
            className="font-sans text-sm text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-4"
          >
            Registrar-se
          </button>
        </div>

        <p className="mt-6 font-sans text-xs text-zinc-600">
          v1.0.0 — PedroLPS KDS
        </p>
      </div>
    </main>
  );
};
