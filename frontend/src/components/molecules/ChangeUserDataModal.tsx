'use client';



import React, { useState } from 'react';

import { X, CheckCircle, AlertCircle, User, Lock, Key } from 'lucide-react';

import { useAuthStore } from '@/store/useAuthStore';



/* --- ChangeUserDataModal --- Kitchen Soft ----------------------- */



interface ChangeUserDataModalProps {

  isOpen: boolean;

  onClose: () => void;

}



export const ChangeUserDataModal: React.FC<ChangeUserDataModalProps> = ({

  isOpen,

  onClose,

}) => {

  const { username, storedPass, updateCredentials } = useAuthStore();

  

  const [name, setName] = useState(username || 'admin');

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');



  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [errorMsg, setErrorMsg] = useState('');



  if (!isOpen) return null;



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    setStatus('idle');

    setErrorMsg('');



    if (!currentPassword || currentPassword !== storedPass) {

      setStatus('error');

      setErrorMsg('A senha atual está incorreta.');

      return;

    }



    if (!currentPassword) {

      setStatus('error');

      setErrorMsg('Informe a senha atual para confirmar as alterações.');

      return;

    }



    if (newPassword && newPassword !== confirmPassword) {

      setStatus('error');

      setErrorMsg('A nova senha e a confirmação não coincidem.');

      return;

    }



    if (newPassword && newPassword.length < 4) {

      setStatus('error');

      setErrorMsg('A nova senha deve ter no mínimo 4 caracteres.');

      return;

    }



    // Update state in store if username changed

    if (name.trim()) {

      updateCredentials(name.trim(), newPassword);

    }



    setStatus('success');

    setCurrentPassword('');

    setNewPassword('');

    setConfirmPassword('');



    setTimeout(() => {

      setStatus('idle');

      onClose();

    }, 1500);

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">

      <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex flex-col gap-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-gray-50">

        

        {/* Header */}

        <div className="flex items-center justify-between border-b border-zinc-700/50 pb-4">

          <h3 className="font-sans font-bold text-xl text-gray-50 flex items-center gap-2">

            <User size={20} className="text-emerald-500" />

            Alterar Dados do Usuário

          </h3>

          <button

            onClick={onClose}

            className="p-1 rounded text-zinc-400 text-gray-50 bg-zinc-700 transition-colors"

          >

            <X size={20} />

          </button>

        </div>



        {/* Form */}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Nome de usuário */}

          <div className="flex flex-col gap-1.5">

            <label className="font-sans text-sm font-medium text-zinc-400">

              Nome de Usuário

            </label>

            <div className="relative">

              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />

              <input

                type="text"

                value={name}

                onChange={(e) => setName(e.target.value)}

                className="w-full h-12 pl-9 pr-4 bg-zinc-900 border border-zinc-700 rounded-md

                           font-sans text-base text-gray-50 outline-none focus:border-emerald-500 transition-colors"

                placeholder="Ex: admin"

              />

            </div>

          </div>



          {/* Senha Atual */}

          <div className="flex flex-col gap-1.5">

            <label className="font-sans text-sm font-medium text-zinc-400">

              Senha Atual <span className="text-red-500">*</span>

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



          {/* Nova Senha */}

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



          {/* Confirmar Nova Senha */}

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



          {/* Messages */}

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



          {/* Buttons */}

          <div className="flex items-center gap-3 mt-2">

            <button

              type="button"

              onClick={onClose}

              className="flex-1 h-12 bg-zinc-700 bg-zinc-600 rounded-md font-sans font-bold text-base text-gray-50 transition-colors"

            >

              CANCELAR

            </button>

            <button

              type="submit"

              className="flex-1 h-12 bg-emerald-500 bg-emerald-400 rounded-md font-sans font-bold text-base text-black transition-colors"

            >

              SALVAR

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};



