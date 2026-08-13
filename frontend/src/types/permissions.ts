/* ─── Permissions & Role Types ─── KDS PedroLPS ─────────────────── */

export type UserRole = 'admin' | 'operator';

export interface Permissions {
  tela_cozinha: boolean;
  tela_balcao: boolean;
  tela_salao: boolean;
  editar_mesas: boolean;
  gerenciar_comandas: boolean;
  enviar_pedidos: boolean;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  tenantId: string;        // uid do admin dono do tenant
  parentUid: string | null; // null para admins, uid do admin-pai para operadores
  permissions: Permissions;
  createdAt: number;
}

/** Default: admin gets ALL permissions */
export const ADMIN_PERMISSIONS: Permissions = {
  tela_cozinha: true,
  tela_balcao: true,
  tela_salao: true,
  editar_mesas: true,
  gerenciar_comandas: true,
  enviar_pedidos: true,
};

/** Default: new operator starts with NO permissions */
export const DEFAULT_OPERATOR_PERMISSIONS: Permissions = {
  tela_cozinha: false,
  tela_balcao: false,
  tela_salao: false,
  editar_mesas: false,
  gerenciar_comandas: false,
  enviar_pedidos: false,
};

/** Human-friendly labels in PT-BR */
export const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  tela_cozinha: 'Cozinha',
  tela_balcao: 'Balcão',
  tela_salao: 'Salão',
  editar_mesas: 'Editar Mesas',
  gerenciar_comandas: 'Gerenciar Comandas',
  enviar_pedidos: 'Enviar Pedidos',
};

/** Group labels for UI sections */
export const PERMISSION_GROUPS = {
  telas: {
    label: 'Telas',
    keys: ['tela_cozinha', 'tela_balcao', 'tela_salao'] as (keyof Permissions)[],
  },
  funcoes: {
    label: 'Funções',
    keys: ['editar_mesas', 'gerenciar_comandas', 'enviar_pedidos'] as (keyof Permissions)[],
  },
};
