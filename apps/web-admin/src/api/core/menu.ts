import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  console.log('getAllMenusApi11111');
  return requestClient.get<RouteRecordStringComponent[]>(
    '/api/menu/user_menus',
  );
}
