import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    created_at: string;
    id: string;
    menus: string[];
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 权限管理相关API
 */
export namespace SystemPermissionApi {
  /** 权限点 */
  export interface SystemPermission {
    [key: string]: any;
    /** 权限ID */
    id: number;
    /** 权限名称 */
    name: string;
    /** 权限描述 */
    description: string;
    /** 路由路径 */
    path: string;
    /** 请求方法 */
    method: string;
    /** 创建时间 */
    created_at?: string;
    /** 更新时间 */
    updated_at?: string;
  }
}

/**
 * 获取权限点列表
 */
async function getPermissions() {
  return requestClient.get<Array<SystemPermissionApi.SystemPermission>>('/api/rbac/permissions');
}

/**
 * 删除权限
 * @param id 权限 ID
 */
async function deletePermission(id: number) {
  return requestClient.delete(`/api/rbac/permissions/${id}`);
}

/**
 * 获取角色列表数据
 * '/api/rbac/roles'
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<{ items: Array<SystemRoleApi.SystemRole>; total: number }>('/api/rbac/roles', {
    params,
  });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/api/rbac/role', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRole(
  id: string,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  // 确保menus字段被正确传递
  return requestClient.post(`/api/rbac/edit_role`, { ...data, id });
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteRole(id: string) {
  return requestClient.delete(`/api/rbac/role/${id}`);
}



export {
  deletePermission,
  createRole,
  deleteRole,
  getPermissions,
  getRoleList,
  updateRole,
};
