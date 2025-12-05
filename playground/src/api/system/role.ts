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
  return requestClient.post('/system/role', data);
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
  return requestClient.post(`/api/rbac/edit/role`, { ...data, id });
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteRole(id: string) {
  return requestClient.delete(`/system/role/${id}`);
}

export { createRole, deleteRole, getRoleList, updateRole };
