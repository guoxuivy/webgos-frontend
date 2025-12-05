<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { getUserDetails, saveUser } from '#/api/user';

defineOptions({
  name: 'UserAdd',
});

const router = useRouter();
const route = useRoute();

// 判断是否为编辑模式
const isEditMode = ref(false);

// 页面标题
const pageTitle = ref('添加用户');

// 表单提交处理
const handleSubmit = async (values: any) => {
  try {
    // 构造符合接口要求的数据格式
    const userData: any = {
      age: values.age ? Number.parseInt(values.age) : 0,
      email: values.email || '',
      gender: values.gender || '',
      nickname: values.nickname || '',
      password: values.password || '',
      phone: values.phone || '',
      username: values.username || '',
    };

    // 如果是编辑模式，需要添加用户ID
    if (isEditMode.value) {
      const userId = route.query.id;
      userData.id = Number(userId);
    }

    await saveUser(userData);

    ElMessage.success(isEditMode.value ? '用户更新成功' : '用户添加成功');
    // 返回用户列表页面
    router.push('/user/list');
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 创建表单
const [Form, formApi] = useVbenForm({
  handleSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入用户名',
      },
      fieldName: 'username',
      label: '用户名',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入昵称',
      },
      fieldName: 'nickname',
      label: '昵称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号',
      },
      fieldName: 'phone',
      label: '手机号',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入密码',
        type: 'password',
      },
      fieldName: 'password',
      label: '密码',
      rules: 'required', // 添加模式下默认为必填
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入年龄',
        min: 0,
        max: 150,
      },
      fieldName: 'age',
      label: '年龄',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
      },
      fieldName: 'gender',
      label: '性别',
    },
  ],
});

// 动态设置密码字段的规则
watch(isEditMode, (value) => {
  formApi.updateSchema([
    {
      fieldName: 'password',
      rules: value ? '' : 'required',
    },
  ]);
});

// 页面加载时检查是否为编辑模式
onMounted(async () => {
  // 检查路由参数中是否有用户ID
  const userId = route.query.id;
  const userData = route.query.userData;

  if (userId) {
    isEditMode.value = true;
    pageTitle.value = '编辑用户';

    if (userData) {
      // 使用从列表页传递的用户数据
      try {
        const parsedUserData = JSON.parse(
          decodeURIComponent(userData as string),
        );
        formApi.setValues(parsedUserData);
      } catch (error) {
        console.error('解析用户数据失败:', error);
      }
    } else {
      // 如果没有传递用户数据，则调用API获取用户详情
      try {
        const userDetails = await getUserDetails(Number(userId));
        // 设置表单值
        formApi.setValues({
          username: userDetails.username,
          nickname: userDetails.nickname,
          email: userDetails.email,
          phone: userDetails.phone,
          age: userDetails.age,
          gender: userDetails.gender,
        });
      } catch (error) {
        console.error('获取用户详情失败:', error);
        ElMessage.error('获取用户详情失败');
      }
    }
  }
});
</script>

<template>
  <Page :title="pageTitle">
    <div class="items-left flex flex-col">
      <div class="w-full max-w-2xl">
        <Form />
      </div>
    </div>
  </Page>
</template>
