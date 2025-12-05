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
    /** 父级ID */
    pid?: number;
    /** 子节点 */
    children?: SystemPermission[];
  }
}

/**
 * 将权限列表转换为树形结构
 * @param permissions 扁平的权限列表
 * @returns 树形结构的权限列表
 */
function convertPermissionsToTree(permissions: Array<SystemPermissionApi.SystemPermission>): Array<SystemPermissionApi.SystemPermission> {
  // 创建权限映射，用于快速查找
  const permissionMap = new Map<number, SystemPermissionApi.SystemPermission>();
  const rootPermissions: Array<SystemPermissionApi.SystemPermission> = [];
  const tempNodes: Record<string, { permission: SystemPermissionApi.SystemPermission; level: number; pathParts: string[] }> = {};

  // 处理每个权限
  permissions.forEach(permission => {
    // 深拷贝权限对象
    const permissionCopy = { ...permission, children: [] };
    permissionMap.set(permission.id, permissionCopy);

    // 分割权限名称，支持斜线(/)和冒号(:)作为分隔符
    const nameParts = permission.name.split(/[:/]/).filter(Boolean);
    if (nameParts.length === 1) {
      // 根节点权限
      rootPermissions.push(permissionCopy);
    } else {
      // 非根节点权限，需要构建临时路径
      for (let i = 0; i < nameParts.length; i++) {
        const path = nameParts.slice(0, i + 1).join(':');
        const level = i;
        const pathParts = nameParts.slice(0, i + 1);

        if (!tempNodes[path]) {
          if (i === nameParts.length - 1) {
            // 叶子节点，使用真实权限
            tempNodes[path] = { permission: permissionCopy, level, pathParts };
          } else {
            // 中间节点，创建临时权限
            tempNodes[path] = {
              permission: {
                id: -Math.abs(hashCode(path)), // 生成临时ID
                name: path,
                description: ``,
                path: '',
                method: '',
                children: [],
              },
              level,
              pathParts,
            };
          }
        }
      }
    }
  });

  // 构建树形结构
  Object.values(tempNodes).forEach(({ permission, level, pathParts }) => {
    if (level === 0) {
      // 顶级节点
      if (!rootPermissions.find(p => p.name === permission.name)) {
        rootPermissions.push(permission);
      }
    } else {
      // 非顶级节点，找到父节点
      const parentPath = pathParts.slice(0, -1).join(':');
      const parent = tempNodes[parentPath]?.permission;
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        // 检查是否已存在该子节点
        if (!parent.children.find(child => child.id === permission.id)) {
          parent.children.push(permission);
        }
      }
    }
  });

  return rootPermissions;
}
// 为字符串添加hashCode方法
function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}



/**
 * 获取权限点列表
 */
async function getPermissions() {
  const permissions = await requestClient.get<Array<SystemPermissionApi.SystemPermission>>('/api/rbac/permissions');
  // 将扁平权限转换为树形结构
  return convertPermissionsToTree(permissions);
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
