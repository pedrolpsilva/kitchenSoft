'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, User, Lock, Key } from 'lucide-react';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { trackButtonClick } from '@/lib/analytics';

interface ChangeUserDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeUserDataModal: React.FC<ChangeUserDataModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { displayName, email, updateCredentials } = useAuthStore();
  
  const [name, setName] = useState(displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    trackButtonClick('btn_fechar_modal_alterar_dados', 'change_user_data_modal');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackButtonClick('btn_salvar_dados_usuario', 'change_user_data_modal', { name });
    setStatus('idle');
    setErrorMsg('');

    const user = auth.currentUser;
    if (!user) {
      setStatus('error');
      setErrorMsg('Sessão expirada. Faça login novamente.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setStatus('error');
        setErrorMsg('Informe a senha atual para alterar a senha.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setStatus('error');
        setErrorMsg('A nova senha e a confirmação não coincidem.');
        return;
      }

      if (newPassword.length < 6) {
        setStatus('error');
        setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (name.trim() && name.trim() !== displayName) {
        await updateProfile(user, { displayName: name.trim() });
        updateCredentials(name.trim());
      }

      if (newPassword && currentPassword) {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      setStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1500);
    } catch (error: any) {
      setStatus('error');
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setErrorMsg('A senha atual está incorreta.');
          break;
        case 'auth/weak-password':
          setErrorMsg('A nova senha é muito fraca. Use no mínimo 6 caracteres.');
          break;
        case 'auth/requires-recent-login':
          setErrorMsg('Sessão expirada. Faça logout e login novamente.');
          break;
        default:
          setErrorMsg('Erro ao salvar alterações. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isGoogleUser = auth.currentUser?.providerData?.some(
    (p) => p.providerId === 'google.com'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex flex-col gap-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-gray-50">
        <div className="flex items-center justify-between border-b border-zinc-700/50 pb-4">
          <h3 className="font-sans font-bold text-xl text-gray-50 flex items-center gap-2">
            <User size={20} className="text-emerald-500" />
            Alterar Dados do Usuário
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded text-zinc-400 hover:text-gray-50 hover:bg-zinc-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium text-zinc-400">
              Nome de Exibição
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 pl-9 pr-4 bg-zinc-900 border border-zinc-700 rounded-md
                           font-sans text-base text-gray-50 outline-none focus:border-emerald-500 transition-colors"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium text-zinc-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full h-12 px-4 bg-zinc-900/50 border border-zinc-700/50 rounded-md
                         font-sans text-base text-zinc-500 outline-none cursor-not-allowed"
            />
          </div>

          {!isGoogleUser && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium text-zinc-400">
                  Senha Atual {newPassword && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-12 pl-9 pr-4 bg-zinc-900 border border-zinc-700 rounded-md
                               font-sans text-base text-gray-50 outline-none focus:border-emerald-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium text-zinc-400">
                  Nova Senha (opcional)
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 pl-9 pr-4 bg-zinc-900 border border-zinc-700 rounded-md
                               font-sans text-base text-gray-50 outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Deixe em branco para não alterar"
                  />
                </div>
              </div>

              {newPassword && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-sm font-medium text-zinc-400">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-9 pr-4 bg-zinc-900 border border-zinc-700 rounded-md
                                 font-sans text-base text-gray-50 outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {isGoogleUser && (
            <p className="font-sans text-sm text-zinc-500 italic">
              Sua conta é gerenciada pelo Google. A senha não pode ser alterada aqui.
            </p>
          )}

          {status === 'error' && errorMsg && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-950/40 border border-red-800 rounded-md text-red-400 font-sans text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/40 border border-emerald-800 rounded-md text-emerald-400 font-sans text-sm">
              <CheckCircle size={16} className="shrink-0" />
              <span>Dados alterados com sucesso!</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 bg-zinc-700 hover:bg-zinc-600 rounded-md font-sans font-bold text-base text-gray-50 transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-400 rounded-md font-sans font-bold text-base text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SALVANDO...' : 'SALVAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
