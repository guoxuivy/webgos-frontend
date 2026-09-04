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
// 菜单 id 单一来源：查询与保存都使用它，避免开门/保存阶段取到不一致的 id
const menuId = ref<number | undefined>();
const checkedKeys = ref<TreeProps['checkedKeys']>([]);
const permissions = ref<DataNode[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!formData.value) return;

    drawerApi.lock();
    try {
      let perm_keys = Array.isArray(checkedKeys.value)
        ? (checkedKeys.value as Array<string>)
        : [];
      // 过滤仅保留真实权限键（含 #），剔除树的中间虚拟节点（v: 前缀）
      perm_keys = perm_keys.filter(
        (k) => typeof k === 'string' && k.includes('#'),
      );

      await assignMenuPermissions({
        menu_id: menuId.value as number,
        perm_keys,
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
        menuId.value = Number(data.id);
        // 加载全量权限树
        await loadPermissions();
        // 加载该菜单已绑定的权限并设为选中
        try {
          const bound = await getMenuPermissions(String(menuId.value));
          checkedKeys.value = (bound || []).map((p) => p.perm_key);
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
    key: permission.key,
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
