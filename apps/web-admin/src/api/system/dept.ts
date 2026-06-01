import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    id: string;
    name: string;
    parent_id?: number;
    leader_id?: number;
    leader?: {
      id: number;
      username: string;
      nickname: string;
    };
    remark?: string;
    status: 0 | 1;
    sort?: number;
  }

  export interface SystemDeptUser {
    id: number;
    username: string;
    nickname: string;
    email?: string;
    phone?: string;
  }

  export interface DeptUserListResult {
    items: SystemDeptUser[];
    total: number;
  }
}

/**
 * 获取部门树结构
 */
async function getDeptTree() {
  return requestClient.get<Array<SystemDeptApi.SystemDept>>(
    '/api/department/tree',
  );
}

/**
 * 获取部门详情
 * @param id 部门ID
 */
async function getDeptById(id: string) {
  return requestClient.get<SystemDeptApi.SystemDept>(`/api/department/${id}`);
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(data: {
  name: string;
  parent_id?: number;
  leader_id?: number;
  remark?: string;
  status?: number;
  order?: number;
}) {
  return requestClient.post('/api/department', data);
}

/**
 * 更新部门
 * @param data 部门数据
 */
async function updateDept(data: {
  id: number;
  name?: string;
  parent_id?: number;
  leader_id?: number;
  remark?: string;
  status?: number;
  order?: number;
}) {
  return requestClient.put('/api/department', data);
}

/**
 * 删除部门
 * @param id 部门ID
 */
async function deleteDept(id: string) {
  return requestClient.delete(`/api/department/${id}`);
}

/**
 * 获取部门用户列表
 * @param id 部门ID
 * @param params 分页参数
 */
async function getDeptUsers(id: string, params?: { page?: number; pageSize?: number }) {
  return requestClient.get<SystemDeptApi.DeptUserListResult>(
    `/api/department/${id}/users`,
    { params },
  );
}

/**
 * 设置部门负责人
 * @param id 部门ID
 * @param leaderId 负责人ID
 */
async function setDeptLeader(id: string, leaderId: number) {
  return requestClient.put(`/api/department/${id}/leader`, { leader_id: leaderId });
}

export {
  createDept,
  deleteDept,
  getDeptById,
  getDeptTree,
  getDeptUsers,
  setDeptLeader,
  updateDept,
};