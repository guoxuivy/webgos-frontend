<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getRoleList } from '#/api/system/role';
import { saveUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits<{ success: [] }>();

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      // 如果是编辑模式且没有输入新密码，则不发送密码字段
      if (id.value && (!values.password || values.password.length === 0)) {
        delete values.password;
      }
      
      await saveUser(values);
      emits('success');
      drawerApi.close();
    } catch (error) {
      console.error('保存用户失败:', error);
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      await initRoleOptions();
      
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        // 编辑模式下不显示密码
        const editData = { ...data };
        if (id.value) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete (editData as any).password;
        }
        formApi.setValues(editData);
      }
    }
  },
});

async function initRoleOptions() {
  try {
    const result = await getRoleList({});
    const options = result.items?.map((item: any) => ({
      label: item.name,
      value: item.id,
    })) || [];
    formApi.updateSchema([
      {
        componentProps: {
          options,
        },
        fieldName: 'roleIds',
      },
    ]);
  } catch (error) {
    console.error('获取角色列表失败:', error);
  }
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});

async function onSubmit(values: Recordable<any>) {
  try {
    // 如果是编辑模式且没有输入新密码，则不发送密码字段
    if (id.value && (!values.password || values.password.length === 0)) {
      delete values.password;
    }
    
    await saveUser(values);
    emits('success');
    drawerApi.close();
  } catch (error) {
    console.error('保存用户失败:', error);
  }
}

defineExpose({ init: () => {} });
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>