'use client';

import React, { useState } from 'react';
import { X, Check, ChefHat, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { trackButtonClick } from '@/lib/analytics';
import { type Permissions, PERMISSION_LABELS, PERMISSION_GROUPS, DEFAULT_OPERATOR_PERMISSIONS } from '@/types/permissions';

interface CreateOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOperatorModal({ isOpen, onClose }: CreateOperatorModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Permissions>(DEFAULT_OPERATOR_PERMISSIONS);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTogglePermission = (key: keyof Permissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (name.length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      trackButtonClick('create_operator_submit', 'create_operator_modal');
      
      const adminUser = auth.currentUser;
      if (!adminUser) {
        throw new Error('Administrador não autenticado.');
      }
      
      const adminUid = adminUser.uid;
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Update profile
      await updateProfile(newUser, { displayName: name });
      
      // Save to Firebase Realtime Database
      await set(ref(database, `users/${newUser.uid}`), {
        uid: newUser.uid,
        role: 'operator',
        displayName: name,
        email: email,
        tenantId: adminUid,
        parentUid: adminUid,
        permissions: permissions,
        createdAt: Date.now()
      });
      
      // Sign out the new user (as creating auto-logs them in)
      await signOut(auth);
      
      setSuccess(true);
      
      // Redirect to login after a few seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 4000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao criar operador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-zinc-800 border-2 border-zinc-700 rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-zinc-700">
          <div className="flex items-center gap-2 text-emerald-500">
            <ChefHat size={24} />
            <h2 className="text-xl font-bold text-zinc-100">Novo Operador</h2>
          </div>
          {!success && (
            <button 
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-500 shadow-[4px_4px_0px_rgba(16,185,129,0.3)]">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Operador Criado!</h3>
              <p className="text-zinc-300 max-w-sm">
                O operador foi criado com sucesso. Por motivos de segurança, você foi desconectado.
              </p>
              <p className="text-emerald-400 mt-4 font-medium">
                Redirecionando para a tela de login...
              </p>
            </div>
          ) : (
            <form id="create-operator-form" onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-3 bg-red-500/10 border-2 border-red-500/50 rounded-md text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={3}
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="João Silva"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="joao@restaurante.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Senha</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="border-t-2 border-zinc-700 pt-4">
                <h3 className="text-lg font-bold text-white mb-4">Permissões</h3>
                
                <div className="space-y-6">
                  {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                    <div key={groupKey}>
                      <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        {group.label}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.keys.map(perm => (
                          <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center w-5 h-5">
                              <input 
                                type="checkbox"
                                checked={permissions[perm as keyof Permissions] || false}
                                onChange={() => handleTogglePermission(perm as keyof Permissions)}
                                className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded bg-zinc-900 checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
                              />
                              <Check size={14} className="absolute text-zinc-900 opacity-0 peer-checked:opacity-100 pointer-events-none font-bold" />
                            </div>
                            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                              {PERMISSION_LABELS[perm as keyof typeof PERMISSION_LABELS] || perm}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-4 border-t-2 border-zinc-700 flex justify-end gap-3 bg-zinc-800/50">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 font-bold text-zinc-300 bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 hover:border-zinc-500 rounded-md transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              form="create-operator-form"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 font-bold text-zinc-900 bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-500 rounded-md transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Operador'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
