import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  /** 用户模型 */
  export interface SystemUser {
    [key: string]: any;
    id?: string;
    username: string;
    password: string;
    nickname?: string;
    email?: string;
    phone?: string;
    status: 0 | 1;
    roleIds?: string[];
    roles?: Array<{ id: string; name: string }>;
    created_at?: string;
    updated_at?: string;
  }
}

/**
 * 获取用户列表数据
 */
async function getUserList(params: any) {
  return requestClient.post<{
    items: SystemUserApi.SystemUser[];
    total: number;
  }>('/api/user/list', params);
}

/**
 * 创建或更新用户
 * @param data 用户数据
 */
async function saveUser(data: any) {
  return requestClient.post('/api/user/edit', data);
}

/**
 * 删除用户
 * @param id 用户ID
 */
async function deleteUser(id: string) {
  return requestClient.post(`/api/user/delete/${id}`);
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
async function getUserInfo(id: string) {
  return requestClient.get<SystemUserApi.SystemUser>(`/api/user/info/${id}`);
}

/**
 * 获取当前登录用户信息
 */
async function getCurrentUserInfo() {
  return requestClient.get<SystemUserApi.SystemUser>('/api/user/info');
}

export { deleteUser, getCurrentUserInfo, getUserInfo, getUserList, saveUser };