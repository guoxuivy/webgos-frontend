import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPermissionApi } from '#/api/system/role';
import type { VbenFormSchema } from '#/adapter/form';

import { $t } from '#/locales';

export function getMethodOptions() {
  return [
    { color: 'primary', label: 'GET', value: 'GET' },
    { color: 'success', label: 'POST', value: 'POST' },
    { color: 'warning', label: 'PUT', value: 'PUT' },
    { color: 'error', label: 'DELETE', value: 'DELETE' },
    { color: 'default', label: 'PATCH', value: 'PATCH' },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.permission.name'),
    },
    {
      component: 'Input',
      fieldName: 'path',
      label: $t('system.permission.path'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getMethodOptions(),
      },
      fieldName: 'method',
      label: $t('system.permission.method'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions<SystemPermissionApi.SystemPermission>['columns'] {
  return [
    {
      align: 'left',
      field: 'name',
      title: $t('system.permission.name'),
      treeNode: true, // 设置为树形节点列
    },
    {
      align: 'left',
      field: 'path',
      title: $t('system.permission.path'),
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getMethodOptions() },
      field: 'method',
      title: $t('system.permission.method'),
    },
    {
      align: 'left',
      field: 'description',
      title: $t('system.permission.description'),
    },
  ];
}