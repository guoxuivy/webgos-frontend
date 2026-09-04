import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    created_at: string;
    id: string;
    menu_ids: number[];
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 权限管理相关API
 */
export namespace SystemPermissionApi {
  /** 权限点（实时路由投影，key = path#method） */
  export interface SystemPermission {
    [key: string]: any;
    /** 权限键，path#method */
    key: string;
    /** 权限名称（= key） */
    name: string;
    /** 权限描述 */
    description: string;
    /** 路由路径 */
    path: string;
    /** 请求方法 */
    method: string;
    /** 子节点 */
    children?: SystemPermission[];
  }
}

/**
 * 将权限列表转换为树形结构
 * 权限 key 形如 path#method（如 /api/menu/:id#GET），按最后一个 # 拆分为路径与方法，
 * 路径按 / 拆分（: 视为普通路径段，不再作为分隔符），避免 /api/menu/:POST 与 /api/menu:POST 被错误合并。
 * @param permissions 扁平的权限列表
 * @returns 树形结构的权限列表
 */
function convertPermissionsToTree(
  permissions: Array<SystemPermissionApi.SystemPermission>,
): Array<SystemPermissionApi.SystemPermission> {
  const permissionMap = new Map<string, SystemPermissionApi.SystemPermission>();
  const rootPermissions: Array<SystemPermissionApi.SystemPermission> = [];
  const tempNodes: Record<
    string,
    {
      permission: SystemPermissionApi.SystemPermission;
      level: number;
      pathParts: string[];
    }
  > = {};

  permissions.forEach((permission) => {
    const permissionCopy = {
      ...permission,
      children: [],
    } as SystemPermissionApi.SystemPermission;
    permissionMap.set(permission.key, permissionCopy);

    // 按最后一个 # 拆分出路径与方法
    const hashIndex = permission.key.lastIndexOf('#');
    const path =
      hashIndex >= 0 ? permission.key.slice(0, hashIndex) : permission.key;
    const method = hashIndex >= 0 ? permission.key.slice(hashIndex + 1) : '';

    // 路径按 / 拆分，方法作为末段；虚拟中间节点使用 v: 前缀键，便于提交时过滤
    const parts = path.split('/').filter(Boolean).concat(method ? [method] : []);
    if (parts.length === 0) {
      rootPermissions.push(permissionCopy);
      return;
    }

    for (let i = 0; i < parts.length; i++) {
      const nodePath = parts.slice(0, i + 1).join('/');
      const level = i;
      const pathParts = parts.slice(0, i + 1);

      if (!tempNodes[nodePath]) {
        if (i === parts.length - 1) {
          // 叶子节点，使用真实权限（key 为 perm_key）
          tempNodes[nodePath] = { permission: permissionCopy, level, pathParts };
        } else {
          // 中间节点，创建虚拟权限（key 以 v: 前缀，非真实 perm_key）
          tempNodes[nodePath] = {
            permission: {
              key: `v:${nodePath}`,
              name: nodePath,
              description: '',
              path: '',
              method: '',
              isVirtual: true,
              children: [],
            } as SystemPermissionApi.SystemPermission,
            level,
            pathParts,
          };
        }
      }
    }
  });

  // 构建树形结构
  Object.values(tempNodes).forEach(({ permission, level, pathParts }) => {
    if (level === 0) {
      if (!rootPermissions.find((p) => p.key === permission.key)) {
        rootPermissions.push(permission);
      }
    } else {
      const parentPath = pathParts.slice(0, -1).join('/');
      const parent = tempNodes[parentPath]?.permission;
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        if (!parent.children.find((child) => child.key === permission.key)) {
          parent.children.push(permission);
        }
      }
    }
  });

  // 优化树形结构：非终端虚拟节点只有一个子节点时省略该节点
  return optimizeTree(rootPermissions);
}

/**
 * 优化树形结构
 * 当非终端节点只有一个子节点时，省略该节点，将子节点提升到当前节点位置
 * @param tree 树形结构
 * @returns 优化后的树形结构
 */
function optimizeTree(
  tree: Array<SystemPermissionApi.SystemPermission>,
): Array<SystemPermissionApi.SystemPermission> {
  const optimizedTree: Array<SystemPermissionApi.SystemPermission> = [];

  tree.forEach((node) => {
    const optimizedNode = {
      ...node,
      children: [],
    } as SystemPermissionApi.SystemPermission & { isVirtual?: boolean };

    if (node.children && node.children.length > 0) {
      const optimizedChildren = optimizeTree(node.children);
      optimizedNode.children = optimizedChildren;

      // 仅当当前节点是临时生成的虚拟节点（isVirtual）且只有一个子节点时，省略该节点
      if (optimizedChildren.length === 1 && optimizedNode.isVirtual) {
        const only = optimizedChildren[0];
        if (only) {
          optimizedTree.push(only);
        }
      } else {
        optimizedTree.push(optimizedNode);
      }
    } else {
      // 叶子节点直接添加
      optimizedTree.push(optimizedNode);
    }
  });

  return optimizedTree;
}

/**
 * 获取权限列表
 * @param params 搜索参数
 */
async function getPermissions(params: Record<string, any> = {}) {
  const permissions = await requestClient.get<
    Array<SystemPermissionApi.SystemPermission>
  >('/api/rbac/permissions', {
    params,
  });
  // 将扁平权限转换为树形结构
  return convertPermissionsToTree(permissions);
}

/**
 * 获取角色列表数据
 * '/api/rbac/roles'
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<{
    items: Array<SystemRoleApi.SystemRole>;
    total: number;
  }>('/api/rbac/roles', {
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
  createRole,
  deleteRole,
  getPermissions,
  getRoleList,
  updateRole,
};
