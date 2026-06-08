import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { z } from '#/adapter/form';
import { getDeptTree } from '#/api/system/dept';
import { $t } from '#/locales';
import { formatDateTime } from '@vben/utils';

export function useSchema() {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.deptName'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.dept.deptName'), 2]))
        .max(
          50,
          $t('ui.formRules.maxLength', [$t('system.dept.deptName'), 50]),
        ),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getDeptTree,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'parent_id',
      label: $t('system.dept.parentDept'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.dept.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.dept.remark'),
      rules: z
        .string()
        .max(200, $t('ui.formRules.maxLength', [$t('system.dept.remark'), 200]))
        .optional(),
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<SystemDeptApi.SystemDept>,
): VxeTableGridOptions<SystemDeptApi.SystemDept>['columns'] {
  return [
    {
      align: 'left',
      field: 'name',
      fixed: 'left',
      title: $t('system.dept.deptName'),
      treeNode: true,
      width: 280,
    },
    {
      field: 'leader.nickname',
      title: $t('system.dept.leader'),
      width: 120,
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.dept.status'),
      width: 100,
    },
    {
      field: 'created_at',
      formatter: ({ row }) => formatDateTime(row.created_at),
      title: $t('system.user.createdAt'),
      width: 180,
    },
    {
      field: 'remark',
      title: $t('system.dept.remark'),
      minWidth: 150,
    },
    {
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.dept.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: $t('system.dept.append'),
            show: (row: SystemDeptApi.SystemDept) => !row.is_member_node,
          },
          {
            code: 'addMembers',
            text: $t('system.dept.addMembers'),
            show: (row: SystemDeptApi.SystemDept) => !row.is_member_node,
          },
          {
            code: 'edit',
            text: $t('common.edit'),
            show: (row: SystemDeptApi.SystemDept) => !row.is_member_node,
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: (row: SystemDeptApi.SystemDept) => !row.is_member_node,
            disabled: (row: SystemDeptApi.SystemDept) => {
              return !!(row.children && row.children.length > 0);
            },
          },
          {
            code: 'removeMember',
            text: $t('system.dept.removeMember'),
            show: (row: SystemDeptApi.SystemDept) => !!row.is_member_node && !!row.original_user_id,
          },
          {
            code: 'setLeader',
            text: $t('system.dept.setLeader'),
            show: (row: SystemDeptApi.SystemDept) => !!row.is_member_node && !!row.original_user_id && !!row.department_id,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 240,
    },
  ];
}
