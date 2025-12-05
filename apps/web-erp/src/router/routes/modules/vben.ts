import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      badgeType: 'dot',
      icon: VBEN_LOGO_URL,
      order: 9999,
      title: 'Vben Admin',
    },
    name: 'VbenProject',
    path: '/vben-admin',
    children: [
      {
        name: 'VbenAbout',
        path: '/vben-admin/about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          icon: 'lucide:copyright',
          title: '关于Vben Admin',
        },
      },
    ],
  },
];

export default routes;
