'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Check, AlertTriangle, ChefHat, Loader2 } from 'lucide-react';
import { ref, get, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { trackButtonClick } from '@/lib/analytics';
import { type Permissions, type UserProfile, PERMISSION_LABELS, PERMISSION_GROUPS, DEFAULT_OPERATOR_PERMISSIONS } from '@/types/permissions';

interface ManageOperatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageOperatorsModal({ isOpen, onClose }: ManageOperatorsModalProps) {
  const [operators, setOperators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<Permissions | null>(null);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOperators();
    }
  }, [isOpen]);

  const fetchOperators = async () => {
    setLoading(true);
    setError('');
    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) {
        throw new Error('Usuário não autenticado.');
      }

      const usersRef = ref(database, 'users');
      const q = query(usersRef, orderByChild('parentUid'), equalTo(adminUid));
      const snapshot = await get(q);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersList = Object.values(usersData) as UserProfile[];
        setOperators(usersList.filter(u => u.role === 'operator' || u.parentUid === adminUid));
      } else {
        setOperators([]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar operadores.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (operator: UserProfile) => {
    trackButtonClick('edit_operator_start', 'manage_operators_modal');
    setEditingId(operator.uid);
    setEditPermissions({ ...DEFAULT_OPERATOR_PERMISSIONS, ...(operator.permissions || {}) });
    setDeletingId(null);
  };

  const handleTogglePermission = (key: keyof Permissions) => {
    if (!editPermissions) return;
    setEditPermissions({
      ...editPermissions,
      [key]: !editPermissions[key]
    });
  };

  const handleSavePermissions = async () => {
    if (!editingId || !editPermissions) return;
    
    try {
      trackButtonClick('edit_operator_save', 'manage_operators_modal');
      await update(ref(database, `users/${editingId}`), {
        permissions: editPermissions,
        role: 'operator'
      });
      
      setOperators(prev => prev.map(op => 
        op.uid === editingId ? { ...op, permissions: editPermissions, role: 'operator' } : op
      ));
      
      setEditingId(null);
      setEditPermissions(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar permissões.');
    }
  };

  const handleStartDelete = (operatorUid: string) => {
    setDeletingId(operatorUid);
    setEditingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      trackButtonClick('delete_operator_confirm', 'manage_operators_modal');
      await remove(ref(database, `users/${deletingId}`));
      
      setOperators(prev => prev.filter(op => op.uid !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao remover operador.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-zinc-800 border-2 border-zinc-700 rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b-2 border-zinc-700">
          <div className="flex items-center gap-2 text-emerald-500">
            <ChefHat size={24} />
            <h2 className="text-xl font-bold text-zinc-100">Gerenciar Operadores</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border-2 border-red-500/50 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="text-emerald-500 animate-spin mb-4" />
              <p className="text-zinc-400 font-medium">Carregando operadores...</p>
            </div>
          ) : operators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">Nenhum operador encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {operators.map(operator => (
                <div key={operator.uid} className="bg-zinc-900 border-2 border-zinc-700 rounded-lg p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{operator.displayName}</h3>
                      <p className="text-sm text-zinc-400">{operator.email}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(operator)}
                        disabled={deletingId === operator.uid}
                        className="p-2 text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-600 rounded-md transition-colors"
                        title="Editar Permissões"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleStartDelete(operator.uid)}
                        disabled={editingId === operator.uid}
                        className="p-2 text-red-400 bg-zinc-800 hover:bg-red-500/20 hover:text-red-300 border border-zinc-600 rounded-md transition-colors"
                        title="Remover Operador"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {editingId !== operator.uid && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(operator.permissions || {})
                        .filter(([_, value]) => value === true)
                        .map(([key]) => (
                          <span key={key} className="px-2 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                            {PERMISSION_LABELS[key as keyof typeof PERMISSION_LABELS] || key}
                          </span>
                      ))}
                    </div>
                  )}

                  {editingId === operator.uid && editPermissions && (
                    <div className="mt-4 pt-4 border-t-2 border-zinc-800">
                      <h4 className="text-sm font-bold text-white mb-3">Editar Permissões</h4>
                      <div className="space-y-4">
                        {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                          <div key={groupKey}>
                            <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                              {group.label}
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {group.keys.map(perm => (
                                <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                                  <div className="relative flex items-center justify-center w-4 h-4">
                                    <input 
                                      type="checkbox"
                                      checked={editPermissions[perm as keyof Permissions] || false}
                                      onChange={() => handleTogglePermission(perm as keyof Permissions)}
                                      className="peer appearance-none w-4 h-4 border-2 border-zinc-600 rounded bg-zinc-800 checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
                                    />
                                    <Check size={12} className="absolute text-zinc-900 opacity-0 peer-checked:opacity-100 pointer-events-none font-bold" />
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
                      <div className="flex justify-end gap-2 mt-4">
                        <button 
                          onClick={() => { setEditingId(null); setEditPermissions(null); }}
                          className="px-3 py-1.5 text-sm font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-md transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleSavePermissions}
                          className="px-3 py-1.5 text-sm font-bold text-zinc-900 bg-emerald-500 hover:bg-emerald-400 rounded-md transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  )}

                  {deletingId === operator.uid && (
                    <div className="mt-4 pt-4 border-t-2 border-red-500/20 bg-red-500/5 p-3 rounded-md">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
                        <div>
                          <h4 className="text-sm font-bold text-red-400 mb-1">Tem certeza?</h4>
                          <p className="text-xs text-zinc-400 mb-3">
                            Isso removerá o operador do sistema. A conta no provedor de autenticação continuará existindo, mas perderá o acesso.
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="px-3 py-1.5 text-sm font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-md transition-colors"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={handleConfirmDelete}
                              className="px-3 py-1.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            >
                              Sim, Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
