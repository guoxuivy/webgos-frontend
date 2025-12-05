<script lang="ts" setup>
import type { TreeInstance } from 'element-plus';

import type { Permission, Role } from '#/api/permission';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import { ElButton, ElCard, ElMessage, ElTree } from 'element-plus';

import {
  getPermissionList,
  getRolePermissionList,
  saveRolePermissions,
} from '#/api/permission';

defineOptions({
  name: 'RolePermission',
});

interface PermissionNode extends Partial<Omit<Permission, 'name'>> {
  label: string;
  children?: PermissionNode[];
  fullPath: string;
  disabled?: boolean;
}

const route = useRoute();
const treeRef = ref<null | TreeInstance>(null);
const treeData = ref<PermissionNode[]>([]);
const checkedKeys = ref<string[]>([]);
const role = ref<null | Role>(null);

// 构建树形结构
const buildTreeData = (permissions: Permission[]): PermissionNode[] => {
  const root: PermissionNode[] = [];
  const map: Record<string, PermissionNode> = {};

  permissions.forEach((permission) => {
    const parts = permission.name.split('/').filter(Boolean);
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const key = currentPath;

      if (!map[key]) {
        const isLeaf = index === parts.length - 1;
        map[key] = {
          label: part,
          fullPath: key,
          description: isLeaf ? permission.description || '' : '',
          path: isLeaf ? permission.path || '' : '',
          method: isLeaf ? permission.method || '' : '',
          id: isLeaf ? permission.id : undefined,
          children: [],
        };
      }
    });
  });

  // 组装树形结构
  Object.keys(map).forEach((key) => {
    const node = map[key];
    const pathParts = key.split('/').filter(Boolean);

    if (pathParts.length === 1) {
      root.push(node!);
    } else {
      const parentPath = `/${pathParts.slice(0, -1).join('/')}`;
      const parentNode = map[parentPath];
      if (parentNode) parentNode.children?.push(node!);
    }
  });

  return root;
};

// 加载权限数据
const loadPermissionData = async () => {
  try {
    const data = await getPermissionList();
    if (Array.isArray(data)) {
      treeData.value = buildTreeData(data);

      // 加载该角色已有的权限
      const roleId = route.params.id;
      if (roleId) {
        try {
          const rolePermissions = await getRolePermissionList(Number(roleId));
          // 设置默认选中的权限
          checkedKeys.value = rolePermissions.map(
            (permission) => `${permission.name}`,
          );
        } catch (error) {
          console.error('获取角色权限失败:', error);
          ElMessage.error('获取角色权限失败');
        }
      }
    } else {
      console.error('数据格式错误:', data);
      ElMessage.error('数据格式错误');
    }
  } catch (error) {
    console.error('获取权限失败:', error);
    ElMessage.error('获取权限失败');
  }
};

const loadData = async () => {
  // 从路由参数中获取角色数据
  const roleData = route.query.roleData;
  if (roleData) {
    try {
      role.value = JSON.parse(decodeURIComponent(roleData as string));
    } catch (error) {
      console.error('解析角色数据失败:', error);
      ElMessage.error('角色数据解析失败');
    }
  } else {
    ElMessage.warning('未获取到角色信息');
  }
  await loadPermissionData();
};

// 保存权限分配
const handleSaveRolePermissions = async () => {
  try {
    if (!treeRef.value || !role.value) return;

    const checkedNodes = treeRef.value.getCheckedNodes(
      false,
      true,
    ) as PermissionNode[];
    const permissions = checkedNodes
      .filter((node) => node.id) // 只选择有id的节点（叶子节点）
      .map((node) => node.id!);

    await saveRolePermissions({
      role_id: role.value.id,
      permission_ids: permissions,
    });
    ElMessage.success('权限分配保存成功');
  } catch (error) {
    console.error('保存权限分配失败:', error);
    ElMessage.error('保存权限分配失败');
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page :title="`为角色【${role?.name || '-'}】分配权限`">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span>权限列表</span>
          <div class="flex gap-2">
            <ElButton type="primary" @click="handleSaveRolePermissions">
              保存权限
            </ElButton>
          </div>
        </div>
      </template>

      <ElTree
        ref="treeRef"
        :data="treeData"
        :default-checked-keys="checkedKeys"
        :default-expand-all="true"
        :expand-on-click-node="true"
        :props="{ children: 'children', label: 'label' }"
        class="w-full"
        node-key="fullPath"
        show-checkbox
      >
        <template #default="{ node, data }">
          <div class="flex w-full items-center justify-between py-1">
            <div class="flex items-center gap-2">
              <span>{{ node.label }}</span>
            </div>
            <span class="max-w-[200px] truncate text-gray-600">
              {{ data.description }}
            </span>
            <div class="flex items-center gap-2">
              <span
                v-if="data.method"
                :class="{
                  'bg-green-100 text-green-800': data.method === 'GET',
                  'bg-blue-100 text-blue-800': data.method === 'POST',
                  'bg-orange-100 text-orange-800': data.method === 'PUT',
                  'bg-red-100 text-red-800': data.method === 'DELETE',
                }"
                class="rounded px-2 py-0.5 text-xs"
              >
                {{ data.method }}
              </span>
              <span
                v-if="data.path"
                class="max-w-[200px] truncate text-xs text-gray-500"
              >
                {{ data.path }}
              </span>
            </div>
          </div>
        </template>
      </ElTree>
    </ElCard>
  </Page>
</template>
