<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPermissions } from '#/api/system/role';
import { useColumns } from './data';
import { useGridFormSchema } from './data';



const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(),
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
      keyField: 'key',
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
      rowField: 'key',
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