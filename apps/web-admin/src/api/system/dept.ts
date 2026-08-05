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
    users?: SystemDeptUser[];
    is_member_node?: boolean;
    original_user_id?: number;
    department_id?: number;
  }

  export interface SystemDeptUser {
    id: number;
    username: string;
    nickname: string;
    status: 0 | 1;
    email?: string;
    phone?: string;
  }
}

async function getDeptTree() {
  return requestClient.get<Array<SystemDeptApi.SystemDept>>(
    '/api/department/tree',
  );
}

async function createDept(data: {
  name: string;
  parent_id?: number;
  leader_id?: number;
  remark?: string;
  status?: number;
  sort?: number;
}) {
  return requestClient.post('/api/department', data);
}

async function updateDept(data: {
  id: number;
  name?: string;
  parent_id?: number;
  leader_id?: number;
  remark?: string;
  status?: number;
  sort?: number;
}) {
  return requestClient.put('/api/department', data);
}

async function deleteDept(id: string) {
  return requestClient.delete(`/api/department/${id}`);
}

async function addDeptUsers(id: string, userIds: number[]) {
  return requestClient.post(`/api/department/${id}/users`, { user_ids: userIds });
}

async function removeDeptUser(userId: number) {
  return requestClient.delete(`/api/department/user/${userId}`);
}

export {
  addDeptUsers,
  createDept,
  deleteDept,
  getDeptTree,
  removeDeptUser,
  updateDept,
};