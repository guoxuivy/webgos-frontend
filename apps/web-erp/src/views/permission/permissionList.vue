<script lang="ts" setup>
import type { Permission } from '#/api/permission';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTree,
} from 'element-plus';

import {
  deletePermission,
  getPermissionList,
  savePermission,
} from '#/api/permission';

defineOptions({
  name: 'PermissionList',
});

// 定义树形节点类型
interface PermissionNode extends Partial<Omit<Permission, 'name'>> {
  label: string;
  children?: PermissionNode[];
  fullPath: string; // 唯一标识，与node-key严格对应
}

// 树形数据
const treeData = ref<PermissionNode[]>([]);

// 树形组件引用（使用最基础的类型）
const treeRef = ref<InstanceType<typeof ElTree> | null>(null);

// 弹窗相关状态
const dialogVisible = ref(false);
const dialogTitle = ref('添加权限');
const formLoading = ref(false);

// 表单数据
const formData = reactive<Partial<Permission & { parentPath?: string }>>({
  name: '',
  description: '',
  path: '',
  method: '',
  parentPath: '',
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路径', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
};

// 表单引用
const formRef = ref<InstanceType<typeof ElForm> | null>(null);

// HTTP方法样式映射
const methodStyles = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-orange-100 text-orange-800',
  DELETE: 'bg-red-100 text-red-800',
};

// 将权限列表转换为树形结构
const buildTreeData = (permissions: Permission[]): PermissionNode[] => {
  const root: PermissionNode[] = [];
  const map: Record<string, PermissionNode> = {};

  permissions.forEach((permission) => {
    const parts = permission.name.split('/').filter(Boolean);
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const key = currentPath;

      if (!map[key]) {
        const isLeaf = index === parts.length - 1;
        map[key] = {
          label: part,
          fullPath: key, // 确保每个节点都有唯一的fullPath
          description: isLeaf ? permission.description || '' : '',
          path: isLeaf ? permission.path || '' : '',
          method: isLeaf ? permission.method || '' : '',
          id: isLeaf ? permission.id : undefined,
          children: [],
        };
      }
    });
  });

  // 构建树形结构
  Object.keys(map).forEach((key) => {
    const node = map[key];
    const pathParts = key.split('/').filter(Boolean);

    if (pathParts.length === 1) {
      root.push(node!);
    } else {
      const parentPath = `/${pathParts.slice(0, -1).join('/')}`;
      const parentNode = map[parentPath];
      if (parentNode) parentNode.children?.push(node!);
    }
  });

  return root;
};

// 加载数据
const loadData = async () => {
  try {
    const data = await getPermissionList();
    if (Array.isArray(data)) {
      treeData.value = buildTreeData(data);
    } else {
      console.error('返回的数据不是数组格式:', data);
      ElMessage.error('数据格式错误');
    }
  } catch (error) {
    console.error('获取权限列表失败:', error);
    ElMessage.error('获取权限列表失败');
  }
};

// 打开添加权限对话框
const handleAdd = (parentNode?: PermissionNode) => {
  formRef.value?.resetFields();
  dialogTitle.value = '添加权限';
  formData.id = undefined;
  formData.parentPath = parentNode?.fullPath || '';
  dialogVisible.value = true;
};

// 打开编辑权限对话框
const handleEdit = (data: PermissionNode) => {
  formRef.value?.resetFields();
  dialogTitle.value = '编辑权限';
  const name = data.fullPath.replace(/^\//, '') || '';
  Object.assign(formData, {
    ...data,
    name,
    parentPath: data.fullPath.split('/').slice(0, -1).join('/') || '',
  });
  dialogVisible.value = true;
};

// 处理删除操作
const handleDelete = async (data: PermissionNode) => {
  if (!data.id) return;
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 "${data.label}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    await deletePermission(data.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除权限失败:', error);
      // ElMessage.error('删除权限失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    formLoading.value = true;
    const fullName = formData.parentPath
      ? `${formData.parentPath.replace(/^\//, '')}/${formData.name}`
      : formData.name;

    const submitData = formData.id
      ? { ...formData, name: fullName }
      : { ...formData, name: fullName, id: 0 };

    await savePermission(submitData as Permission);
    ElMessage.success(formData.id ? '更新成功' : '添加成功');
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    if (typeof error !== 'string') {
      console.error('提交失败:', error);
    }
  } finally {
    formLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page title="权限列表">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span>权限列表</span>
          <div class="flex gap-2">
            <ElButton type="primary" @click="handleAdd()"> 添加权限 </ElButton>
          </div>
        </div>
      </template>

      <ElTree
        ref="treeRef"
        :auto-expand-parent="true"
        :data="treeData"
        :default-expand-all="true"
        :expand-on-click-node="true"
        :props="{
          children: 'children',
          label: 'label',
        }"
        class="w-full"
        node-key="fullPath"
      >
        <template #default="{ node, data }">
          <div class="flex w-full items-center justify-between py-1">
            <div class="flex items-center gap-2">
              <span>{{ node.label }}</span>
            </div>

            <span class="max-w-[200px] truncate text-gray-600">
              {{ data.description }}
            </span>

            <div class="flex items-center gap-2">
              <span
                v-if="data.method"
                :class="
                  methodStyles[data.method as keyof typeof methodStyles] ||
                  'bg-blue-100 text-blue-800'
                "
                class="rounded px-2 py-0.5 text-xs"
              >
                {{ data.method }}
              </span>
              <span
                v-if="data.path"
                class="max-w-[200px] truncate text-xs text-gray-500"
              >
                {{ data.path }}
              </span>

              <div v-if="data.id" class="flex gap-1">
                <ElButton
                  size="small"
                  text
                  type="primary"
                  @click.stop="handleEdit(data)"
                >
                  编辑
                </ElButton>
                <ElButton
                  size="small"
                  text
                  type="danger"
                  @click.stop="handleDelete(data)"
                >
                  删除
                </ElButton>
              </div>
              <div class="flex gap-1">
                <ElButton
                  v-if="!data.path"
                  size="small"
                  text
                  type="warning"
                  @click.stop="() => handleAdd(data)"
                >
                  添加子项
                </ElButton>
              </div>
            </div>
          </div>
        </template>
      </ElTree>
    </ElCard>

    <!-- 权限编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="500px"
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        class="mt-4"
        label-width="100px"
      >
        <ElFormItem label="权限名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入权限名称" />
        </ElFormItem>

        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="formData.description"
            placeholder="请输入权限描述"
          />
        </ElFormItem>

        <ElFormItem label="请求路径" prop="path">
          <ElInput v-model="formData.path" placeholder="请输入请求路径" />
        </ElFormItem>

        <ElFormItem label="请求方法" prop="method">
          <ElSelect v-model="formData.method" placeholder="请选择请求方法">
            <ElOption label="GET" value="GET" />
            <ElOption label="POST" value="POST" />
            <ElOption label="PUT" value="PUT" />
            <ElOption label="DELETE" value="DELETE" />
          </ElSelect>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton :loading="formLoading" type="primary" @click="handleSubmit">
          确定
        </ElButton>
      </template>
    </ElDialog>
  </Page>
</template>
