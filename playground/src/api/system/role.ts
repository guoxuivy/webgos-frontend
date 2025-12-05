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

  // 优化树形结构：非终端节点只有一个子节点时省略该节点
  return optimizeTree(rootPermissions);
}

/**
 * 优化树形结构
 * 当非终端节点只有一个子节点时，省略该节点，将子节点提升到当前节点位置
 * @param tree 树形结构
 * @returns 优化后的树形结构
 */
function optimizeTree(tree: Array<SystemPermissionApi.SystemPermission>): Array<SystemPermissionApi.SystemPermission> {
  const optimizedTree: Array<SystemPermissionApi.SystemPermission> = [];

  tree.forEach(node => {
    // 深拷贝节点
    const optimizedNode = { ...node, children: [] };

    // 如果节点有子节点，递归优化子节点
    if (node.children && node.children.length > 0) {
      const optimizedChildren = optimizeTree(node.children);
      (optimizedNode as any).children = optimizedChildren;

      // 如果只有一个子节点，且当前节点是临时生成的节点（ID为负数），则省略该节点
      if (optimizedChildren.length === 1 && optimizedNode.id < 0) {
        // 将当前节点的属性合并到子节点
        const child = { ...optimizedChildren[0] };
        // 确保子节点具有必需的id属性
        if (child.id === undefined) {
          child.id = optimizedNode.id;
        }
        // 保留子节点的ID，合并其他属性
        child.name = child.name;
        child.description = child.description || optimizedNode.description;
        optimizedTree.push(child);
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
 * 获取权限列表
 * @param params 搜索参数
 */
async function getPermissions(params: Record<string, any> = {}) {
  const permissions = await requestClient.get<Array<SystemPermissionApi.SystemPermission>>('/api/rbac/permissions',{
    params,
  });
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
