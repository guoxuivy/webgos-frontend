<script lang="ts" setup>
import type { Role } from '#/api/permission';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElForm,
  ElFormItem,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { getRoleList, saveUserRoles } from '#/api/permission';
import { getUserList } from '#/api/user';

defineOptions({
  name: 'UserList',
});

const router = useRouter();

// 定义用户数据类型（根据实际后端返回结构调整）
export interface User {
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
  rolesname: string[];
}

// 表格数据
const tableData = ref<User[]>([]);

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 角色编辑弹窗相关
const roleDialogVisible = ref(false);
const selectedUser = ref<null | User>(null);
const roleList = ref<Role[]>([]);
const selectedRoleIds = ref<number[]>([]);

// 加载数据的函数
const loadData = async () => {
  try {
    // 从API获取数据
    const data = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
    });

    if (data && Array.isArray(data.items)) {
      tableData.value = data.items;
      total.value = data.total;

      // 处理角色名称显示
      tableData.value.forEach((user) => {
        user.rolesname = user.roles?.map((role: any) => role.name) || [];
      });
    } else {
      console.warn('Response data is empty or invalid:', data);
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error('获取用户列表失败:', error);
  }
};

// 加载角色列表
const loadRoleList = async () => {
  try {
    const page = await getRoleList();
    roleList.value = page.items;
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error('获取角色列表失败:', error);
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadData();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadData();
};

// 跳转到添加用户页面
const goToAddUser = () => {
  router.push('/user/add');
};

// 跳转到编辑用户页面
const goToEditUser = (user: User) => {
  router.push({
    path: '/user/add',
    query: {
      id: user.id,
      userData: encodeURIComponent(
        JSON.stringify({
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          age: user.age,
          gender: user.gender,
        }),
      ),
    },
  });
};

// 打开角色编辑弹窗
const openRoleEditDialog = (user: User) => {
  selectedUser.value = user;
  // 初始化选中的角色ID
  selectedRoleIds.value = user.roles?.map((role: any) => role.id) || [];
  roleDialogVisible.value = true;

  // 加载角色列表
  if (roleList.value.length === 0) {
    loadRoleList();
  }
};

// 保存用户角色
const handleSaveUserRoles = async () => {
  try {
    if (!selectedUser.value) return;

    // 调用API保存用户角色
    await saveUserRoles({
      user_id: selectedUser.value.id,
      role_ids: selectedRoleIds.value,
    });

    ElMessage.success('用户角色更新成功');
    roleDialogVisible.value = false;
    // 重新加载数据以更新视图
    loadData();
  } catch (error) {
    ElMessage.error('更新用户角色失败');
    console.error('更新用户角色失败:', error);
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <Page title="用户列表">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span>用户列表</span>
          <ElButton type="primary" @click="goToAddUser">添加用户</ElButton>
        </div>
      </template>

      <ElTable :data="tableData" border stripe>
        <ElTableColumn label="ID" prop="id" width="80" />
        <ElTableColumn label="用户名" prop="username" />
        <ElTableColumn label="昵称" prop="nickname" />
        <ElTableColumn label="角色" prop="rolesname">
          <template #default="scope">
            <div
              v-if="scope.row.rolesname && scope.row.rolesname.length > 0"
              class="flex flex-wrap gap-1"
            >
              <span
                v-for="(role, index) in scope.row.rolesname"
                :key="index"
                class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                {{ role }}
              </span>
            </div>
            <span v-else>-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="注册时间" prop="created_at" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200">
          <template #default="scope">
            <ElButton
              size="small"
              type="primary"
              @click="goToEditUser(scope.row)"
            >
              编辑
            </ElButton>
            <ElButton
              size="small"
              type="warning"
              @click="openRoleEditDialog(scope.row)"
            >
              角色
            </ElButton>
            <ElButton size="small" type="danger">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="mt-4 flex items-center justify-end">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </ElCard>

    <!-- 角色编辑弹窗 -->
    <ElDialog
      v-model="roleDialogVisible"
      :title="`编辑用户【${selectedUser?.username}】的角色`"
      width="500px"
    >
      <ElForm>
        <ElFormItem label="角色列表">
          <ElCheckboxGroup v-model="selectedRoleIds">
            <div class="grid grid-cols-2 gap-2">
              <ElCheckbox
                v-for="role in roleList"
                :key="role.id"
                :label="role.id"
                :value="role.id"
              >
                {{ role.name }}
              </ElCheckbox>
            </div>
          </ElCheckboxGroup>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="roleDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSaveUserRoles">保存</ElButton>
        </div>
      </template>
    </ElDialog>
  </Page>
</template>
