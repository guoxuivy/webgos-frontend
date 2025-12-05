<script lang="ts" setup>
import type {
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPermissions } from '#/api/system/role';


import { useColumns } from './data';

const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          const data = await getPermissions();
          return data;
          // return { 
          //   items: data,
          //   total: data.length 
          // };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
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
