<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemPermissionApi } from '#/api/system/role';

import { $t } from '#/locales';
import { Page } from '@vben/common-ui';
import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPermissions, deletePermission } from '#/api/system/role';
import { useColumns } from './data';
import { useGridFormSchema } from './data';



/**
 * 删除部门
 * @param row
 */
function onDelete(row: SystemPermissionApi.SystemPermission) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deletePermission(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      gridApi.query();
    })
    .catch(() => {
      hideLoading();
    });
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemPermissionApi.SystemPermission>) {
  switch (code) {
    // case 'append': {
    //   onAppend(row);
    //   break;
    // }
    case 'delete': {
      onDelete(row);
      break;
    }
    // case 'edit': {
    //   onEdit(row);
    //   break;
    // }
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    // 关闭分页
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) => {
          const data = await getPermissions(formValues);
          // 不分页直接返回列表
          return data;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    // 树配置
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      childrenField: 'children',
      transform: false,
      // 默认展开全部节点
      expandAll: true,
    },
  } as VxeTableGridOptions,
});
</script>
<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <!-- 权限管理暂时不需要创建功能，因为权限是自动生成的 -->
      </template>
    </Grid>
  </Page>
</template>
<style lang="scss" scoped>
</style>