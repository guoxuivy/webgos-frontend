import { requestClient } from '#/api/request';

export interface Permission {
  id: number;
  name: string;
  description: string;
  path: string;
  method: string;
}

/**
 * 获取权限列表
 */
export function getPermissionList(): Promise<Permission[]> {
  return requestClient.get('/api/rbac/permissions');
}

export interface Role {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  remark: string;
}
export interface RolePage {
  items: Role[];
  total: number;
}

/**
 * 获取角色列表
 */
export function getRoleList(): Promise<RolePage> {
  return requestClient.get('/api/rbac/roles');
}

/**
 * 添加角色
 */
export function addRole(post: {
  description: string;
  name: string;
}): Promise<any> {
  return requestClient.post('/api/rbac/add/role', { ...post });
}

/**
 * 更新角色
 */
export function updateRole(post: {
  description: string;
  id: number;
  name: string;
}): Promise<any> {
  return requestClient.post('/api/rbac/edit/role', { ...post });
}

export function savePermission(post: Permission): Promise<Role[]> {
  return requestClient.post('/api/rbac/updatePermission', { ...post });
}
export function deletePermission(id: number | undefined): Promise<Role[]> {
  return requestClient.get(`/api/rbac/deletePermission/${id}`);
}

/**
 * 获取角色拥有的权限列表
 * /role/:id/permissions
 */
export function getRolePermissionList(
  id: number | undefined,
): Promise<Permission[]> {
  return requestClient.get(`/api/rbac/role/${id}/permissions`);
}

// 保存角色的权限
export function saveRolePermissions(post: {
  permission_ids: number[];
  role_id: number;
}): Promise<any> {
  return requestClient.post('/api/rbac/assign/permissions', { ...post });
}

// 保存用户的角色
export function saveUserRoles(post: {
  role_ids: number[];
  user_id: number;
}): Promise<any> {
  return requestClient.post('/api/rbac/assign/roles', { ...post });
}
