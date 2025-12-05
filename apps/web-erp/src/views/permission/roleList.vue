<script lang="ts" setup>
import type { Role } from '#/api/permission';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { addRole, getRoleList, updateRole } from '#/api/permission';

defineOptions({
  name: 'RoleList',
});

const router = useRouter();

// 表格数据
const tableData = ref<Role[]>([]);

// 控制弹窗显示
const dialogVisible = ref(false);

// 弹窗标题
const dialogTitle = ref('');

// 是否为编辑模式
const isEditMode = ref(false);

// 表单引用
const formRef = ref();

// 表单数据
const formData = ref({
  id: undefined as number | undefined,
  name: '',
  description: '',
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度为2-20个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { max: 100, message: '角色描述最多100个字符', trigger: 'blur' },
  ],
};

// 加载数据的函数
const loadData = async () => {
  try {
    const page = await getRoleList();
    const data = page.items;
    // 检查返回的数据是否为数组
    if (Array.isArray(data)) {
      tableData.value = data;
    } else {
      console.error('返回的数据不是数组格式:', data);
      ElMessage.error('数据格式错误');
    }
  } catch (error) {
    console.error('获取角色列表失败:', error);
    ElMessage.error('获取角色列表失败');
  }
};

// 跳转到角色权限分配页面
const assignPermissions = (role: Role) => {
  router.push({
    path: `/permission/role-permission/${role.id}`,
    query: {
      roleData: encodeURIComponent(JSON.stringify(role)),
    },
  });
};

// 打开添加角色弹窗
const openAddRoleDialog = () => {
  dialogTitle.value = '添加角色';
  isEditMode.value = false;
  formData.value = {
    id: undefined,
    name: '',
    description: '',
  };
  dialogVisible.value = true;
};

// 打开编辑角色弹窗
const openEditRoleDialog = (role: Role) => {
  dialogTitle.value = '编辑角色';
  isEditMode.value = true;
  formData.value = {
    id: role.id,
    name: role.name,
    description: role.description,
  };
  dialogVisible.value = true;
};

// 保存角色
const saveRole = async () => {
  try {
    await formRef.value.validate();

    if (isEditMode.value) {
      // 编辑模式
      await updateRole({
        id: formData.value.id!,
        name: formData.value.name,
        description: formData.value.description,
      });
      ElMessage.success('角色更新成功');
    } else {
      // 新增模式
      await addRole({
        name: formData.value.name,
        description: formData.value.description,
      });
      ElMessage.success('角色创建成功');
    }

    dialogVisible.value = false;
    loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存角色失败:', error);
    ElMessage.error(isEditMode.value ? '角色更新失败' : '角色创建失败');
  }
};

// 删除角色
const deleteRole = (role: Role) => {
  ElMessage.info(`删除角色 ${role.name} 功能待实现`);
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <Page title="角色列表">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span>角色列表</span>
          <ElButton type="primary" @click="openAddRoleDialog">
            添加角色
          </ElButton>
        </div>
      </template>

      <ElTable :data="tableData" border stripe>
        <ElTableColumn label="ID" prop="id" width="80" />
        <ElTableColumn label="角色名称" prop="name" />
        <ElTableColumn label="描述" prop="description" />
        <ElTableColumn label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="更新时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200">
          <template #default="scope">
            <ElButton
              size="small"
              type="primary"
              @click="openEditRoleDialog(scope.row)"
            >
              编辑
            </ElButton>
            <ElButton
              size="small"
              type="success"
              @click="assignPermissions(scope.row)"
            >
              权限
            </ElButton>
            <ElButton size="small" type="danger" @click="deleteRole(scope.row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
    <!-- 角色编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <ElFormItem label="角色名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入角色名称" />
        </ElFormItem>

        <ElFormItem label="角色描述" prop="description">
          <ElInput
            v-model="formData.description"
            :rows="3"
            placeholder="请输入角色描述"
            type="textarea"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveRole">
          {{ isEditMode ? '更新角色' : '创建角色' }}
        </ElButton>
      </template>
    </ElDialog>
  </Page>
</template>
