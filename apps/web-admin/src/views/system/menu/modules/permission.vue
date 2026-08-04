<script lang="ts" setup>
import type { SystemMenuApi } from '#/api/system/menu';
import type { SystemPermissionApi } from '#/api/system/role';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '#/locales';
import { assignMenuPermissions, getMenuPermissions, getPermissions } from '#/api/system/menu';

import { Tree, message } from 'ant-design-vue';
import type { TreeProps } from 'ant-design-vue';
import type { DataNode } from 'ant-design-vue/es/tree';

const emits = defineEmits<{ success: [] }>();

const formData = ref<SystemMenuApi.SystemMenu>();
const checkedKeys = ref<TreeProps['checkedKeys']>([]);
const permissions = ref<DataNode[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!formData.value) return;

    drawerApi.lock();
    try {
      let permission_ids = Array.isArray(checkedKeys.value) ? checkedKeys.value.map(Number) : [];
      // 过滤负数ID（树的中间虚拟节点）
      permission_ids = permission_ids.filter((id) => id >= 0);

      await assignMenuPermissions({
        menu_id: Number(formData.value.id),
        permission_ids,
      });

      message.success($t('common.saveSuccess'));
      emits('success');
      drawerApi.close();
    } catch (error) {
      console.error($t('common.saveFailed'), error);
      message.error($t('common.saveFailed'));
    } finally {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemMenuApi.SystemMenu>();
      if (data) {
        formData.value = data;
        // 加载全量权限树
        await loadPermissions();
        // 加载该菜单已绑定的权限并设为选中
        try {
          const bound = await getMenuPermissions(String(data.id));
          checkedKeys.value = bound.map((p) => p.id) || [];
        } catch {
          checkedKeys.value = [];
        }
      }
    }
  },
});

async function loadPermissions() {
  try {
    const permissionData = await getPermissions();
    permissions.value = permissionData.map(transformPermission);
  } catch (error) {
    message.error($t('common.loadFail'));
  }
}

// 转换权限数据以适配 Tree 组件
function transformPermission(permission: SystemPermissionApi.SystemPermission): DataNode {
  return {
    ...permission,
    key: permission.id,
    children: permission.children?.map(transformPermission) || [],
  };
}

function onCheck(checked: TreeProps['checkedKeys']) {
  checkedKeys.value = checked;
}
</script>

<template>
  <Drawer :title="$t('system.menu.setPermissions')">
    <div class="h-full">
      <Tree
        v-if="permissions.length > 0"
        v-model:checkedKeys="checkedKeys"
        :field-names="{ children: 'children', title: 'name', key: 'key' }"
        :tree-data="permissions"
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
