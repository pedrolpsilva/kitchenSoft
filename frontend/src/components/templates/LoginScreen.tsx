'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ChefHat } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

/* ─── LoginScreen ─── KDS PedroLPS ───────────────────────────────── */

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const login = useAuthStore((s) => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(username, password);
    if (!success) {
      setError('Credenciais inválidas. Tente novamente.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
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
        {/* Logo */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-username"
              className="font-sans text-sm font-medium text-zinc-400"
            >
              Usuário
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="
                h-14 px-4 bg-zinc-900 border border-zinc-700 rounded-md
                font-sans text-base text-gray-50 placeholder-zinc-600
                outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                transition-colors
              "
            />
          </div>

          {/* Password */}
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
                className="
                  w-full h-14 px-4 pr-12 bg-zinc-900 border border-zinc-700 rounded-md
                  font-sans text-base text-gray-50 placeholder-zinc-600
                  outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                  transition-colors
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="font-sans text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="
              w-full h-16 mt-2 bg-emerald-500 rounded-md
              font-sans font-bold text-lg text-black
              select-none transition-all duration-75
              active:scale-[0.97] active:opacity-80
            "
          >
            ENTRAR
          </button>
        </form>

        <p className="mt-8 font-sans text-xs text-zinc-600">
          v1.0.0 — PedroLPS KDS
        </p>
      </div>
    </main>
  );
};
