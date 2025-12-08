<script lang="ts" setup>
import type { SystemRoleApi } from '#/api/system/role';
import type { SystemPermissionApi } from '#/api/system/role';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '#/locales';
import { getPermissions, updateRole } from '#/api/system/role';

import { Tree, message } from 'ant-design-vue';
import type { TreeProps } from 'ant-design-vue';
import type { DataNode } from 'ant-design-vue/es/tree';

const emits = defineEmits<{ success: [] }>();

const formData = ref<SystemRoleApi.SystemRole>();
const checkedKeys = ref<TreeProps['checkedKeys']>([]);
const permissions = ref<DataNode[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!formData.value) return;
    
    drawerApi.lock();
    try {
      await updateRole(formData.value.id, { 
        ...formData.value,
        menus: Array.isArray(checkedKeys.value) ? checkedKeys.value : []
      });
      
      message.success($t('common.saveSuccess'));
      emits('success');
      drawerApi.close();
    } catch (error) {
      console.error($t('system.permission.saveFailed'), error);
    } finally {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      if (data) {
        formData.value = data;
        // 设置已选中的权限
        checkedKeys.value = data.menus || [];
        
        // 加载所有权限列表
        await loadPermissions();
      }
    }
  },
});

async function loadPermissions() {
  try {
    const permissionData = await getPermissions();
    // 转换权限数据格式以匹配 Tree 组件的 DataNode 类型，并确保有 key 字段
    permissions.value = permissionData.map(transformPermission);
  } catch (error) {
    console.error($t('system.permission.loadFailed'), error);
    message.error($t('common.loadFail'));
  }
}

// 转换权限数据以适配 Tree 组件
function transformPermission(permission: SystemPermissionApi.SystemPermission): DataNode {
  return {
    ...permission,
    key: permission.id,
    // 递归转换子权限
    children: permission.children?.map(transformPermission) || [],
  };
}

function onCheck(checked: TreeProps['checkedKeys']) {
  checkedKeys.value = checked;
}
</script>

<template>
  <Drawer :title="$t('system.role.setAPIPermissions')">
    <div class="h-full">
      <Tree
        v-if="permissions.length > 0"
        v-model:checkedKeys="checkedKeys"
        :tree-data="permissions"
        :field-names="{ children: 'children', title: 'name', key: 'key' }"
        checkable
        class="h-full overflow-auto"
        default-expand-all
        @check="onCheck"
      >
        <template #title="{ description, name }">
          <span>{{ name }}</span>
          <span v-if="description" class="ml-2 text-xs text-gray-500">{{ description }}</span>
        </template>
      </Tree>
      <div v-else class="flex h-full items-center justify-center">
        <div class="text-muted-foreground">{{ $t('common.loading') }}</div>
      </div>
    </div>
  </Drawer>
</template>