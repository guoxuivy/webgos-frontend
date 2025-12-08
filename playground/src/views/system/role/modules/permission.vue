<script lang="ts" setup>
import type { SystemRoleApi } from '#/api/system/role';
import type { SystemPermissionApi } from '#/api/system/role';

import { ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '#/locales';
import { getPermissions, updateRole } from '#/api/system/role';

import { Tree, message } from 'ant-design-vue';
import type { TreeProps } from 'ant-design-vue';

const emits = defineEmits<{ success: [] }>();

const formData = ref<SystemRoleApi.SystemRole>();
const checkedKeys = ref<TreeProps['checkedKeys']>([]);
const permissions = ref<SystemPermissionApi.SystemPermission[]>([]);

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
      console.error('保存权限失败:', error);
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
    permissions.value = await getPermissions();
  } catch (error) {
    console.error('加载权限列表失败:', error);
    message.error($t('common.loadFail'));
  }
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
        :field-names="{ children: 'children', title: 'name', key: 'id' }"
        checkable
        class="h-full overflow-auto"
        default-expand-all
        @check="onCheck"
      />
      <div v-else class="flex h-full items-center justify-center">
        <div class="text-muted-foreground">{{ $t('common.loading') }}</div>
      </div>
    </div>
  </Drawer>
</template>
