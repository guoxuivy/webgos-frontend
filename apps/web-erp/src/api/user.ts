import type { User } from '#/views/user/index.vue';

import { requestClient } from './request';

// 根据实际API响应结构调整接口定义
export interface UserListResponse {
  items: User[];
  total: number;
}

export interface UserListParams {
  page: number;
  pageSize: number;
}

// 用户添加/编辑接口数据格式
export interface UserFormData {
  id?: number; // 可选的id字段，添加时不需要，编辑时需要
  age: number;
  email: string;
  gender: string;
  nickname: string;
  password: string;
  phone: string;
  username: string;
}

// 用户详情响应数据格式
export interface UserDetailsResponse {
  id: number;
  created_at: string;
  updated_at: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  age: number;
  roles: any;
}

/**
 * 获取用户列表
 */
export async function getUserList(params: UserListParams) {
  return requestClient.post<UserListResponse>('/api/user/list', params);
}

/**
 * 保存用户（添加或修改）
 * @param data 用户数据，添加时不需要id，修改时需要传入id
 */
export async function saveUser(data: UserFormData) {
  return requestClient.post<any>('/api/user/edit', data);
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
export async function getUserDetails(id: number) {
  return requestClient.get<UserDetailsResponse>(`/api/user/details/${id}`);
}
