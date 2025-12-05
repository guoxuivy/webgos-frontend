import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPermissionApi } from '#/api/system/role';
import type { OnActionClickFn } from '#/adapter/vxe-table';

import { formatDateTime } from '@vben/utils';
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

export function useColumns(
  onActionClick: OnActionClickFn<SystemPermissionApi.SystemPermission>,
): VxeTableGridOptions<SystemPermissionApi.SystemPermission>['columns'] {
  return [
    {
      align: 'center',
      field: 'id',
      title: $t('system.permission.id'),
      width: 80,
    },
    {
      align: 'left',
      field: 'name',
      title: $t('system.permission.name'),
      width: 200,
    },
    {
      align: 'left',
      field: 'path',
      title: $t('system.permission.path'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getMethodOptions() },
      field: 'method',
      title: $t('system.permission.method'),
      width: 100,
    },
    {
      align: 'left',
      field: 'description',
      title: $t('system.permission.description'),
      minWidth: 300,
    },
    {
      field: 'created_at',
      formatter: ({ cellValue }) => formatDateTime(cellValue),
      title: $t('system.permission.createdAt'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        props: {
          actions: [
            {
              label: $t('common.delete'),
              type: 'error',
            },
          ],
        },
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.permission.name'),
          onClick: onActionClick,
        },
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 130,
    },
  ];
}
