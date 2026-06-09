<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';
import { getUserList } from '#/api/system/user';
import { $t } from '#/locales';

const emit = defineEmits<{
  success: [userIds: number[]];
}>();

const selectedRowIds = ref<number[]>([]);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'username',
        label: '',
        hideLabel: true,
        componentProps: {
          placeholder: $t('system.user.username'),
        },
      },
    ],
    submitOnChange: true,
    showDefaultActions: false,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1',
  },
  separator: false,
  gridOptions: {
    columns: [
      { type: 'checkbox', width: 40 },
      {
        field: 'nickname',
        title: $t('system.user.nickname'),
      },
      {
        field: 'username',
        title: $t('system.user.username'),
      },
      {
        field: 'email',
        title: $t('system.user.email'),
      },
      {
        field: 'phone',
        title: $t('system.user.phone'),
      },
    ],
    height: '500',
    keepSource: true,
    pagerConfig: {
      enabled: true,
      pageSize: 10,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page = { currentPage: 1, pageSize: 10 } }, formValues: Record<string, any>) => {
          const result = await getUserList({
            page: page.currentPage || 1,
            pageSize: page.pageSize || 10,
            ...formValues,
          });
          return result;
        },
      },
    },
    toolbarConfig: {
      enabled: false,
    },
    checkboxConfig: {
      checkRowKeys: selectedRowIds.value,
    },
  },
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-[50%]',
  async onConfirm() {
    const records = gridApi.grid.getCheckboxRecords() as SystemUserApi.SystemUser[];
    const userIds = records.map((r) => parseInt(r.id!));
    if (userIds.length === 0) {
      return;
    }
    emit('success', userIds);
    modalApi.close();
  },
});

function open() {
  selectedRowIds.value = [];
  modalApi.open();
}

defineExpose({ open });
</script>

<template>
  <Modal :title="$t('system.dept.selectUsers')">
    <Grid />
  </Modal>
</template>
