import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'mdi:account-cog',
      order: 100,
      title: $t('page.user.management'),
    },
    name: 'UserManagement',
    path: '/user',
    children: [
      {
        name: 'UserList',
        path: '/user/list',
        component: () => import('#/views/user/index.vue'),
        meta: {
          icon: 'mdi:format-list-bulleted',
          title: $t('page.user.list'),
        },
      },
      {
        name: 'UserAdd',
        path: '/user/add',
        component: () => import('#/views/user/add.vue'),
        meta: {
          title: $t('page.user.add'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
