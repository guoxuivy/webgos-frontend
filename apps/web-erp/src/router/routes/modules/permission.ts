import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'mdi:lock-outline',
      order: 101,
      title: $t('page.permission.management'),
    },
    name: 'PermissionManagement',
    path: '/permission',
    children: [
      {
        name: 'PermissionList',
        path: '/permission/permission-list',
        component: () => import('#/views/permission/permissionList.vue'),
        meta: {
          icon: 'mdi:format-list-bulleted',
          title: $t('page.permission.permissionList'),
        },
      },
      {
        name: 'RoleList',
        path: '/permission/role-list',
        component: () => import('#/views/permission/roleList.vue'),
        meta: {
          icon: 'mdi:account-multiple',
          title: $t('page.permission.roleList'),
        },
      },
      {
        name: 'RolePermission',
        path: '/permission/role-permission/:id',
        component: () => import('#/views/permission/rolePermission.vue'),
        meta: {
          hideInMenu: true,
          title: $t('page.permission.rolePermission'),
        },
      },
    ],
  },
];

export default routes;
