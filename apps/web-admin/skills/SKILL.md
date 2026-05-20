# 前端页面开发技能总结 - 角色管理模块

## 概述

基于 Vue Vben Admin 框架的角色管理模块实现，涵盖列表展示、添加、修改、筛选等核心功能，总结了企业级后台管理系统前端开发的关键技能。

---

## 一、数据表格开发技能

### 1.1 表格组件初始化

```typescript
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['created_at', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const result = await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          return result;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  },
});
```

**关键技巧：**
- 使用 `useVbenVxeGrid` 组合式函数创建表格
- `proxyConfig.ajax.query` 配置异步数据请求
- `submitOnChange: true` 实现筛选表单自动提交

### 1.2 表格列配置

```typescript
export function useColumns<T>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'edit', text: $t('common.edit') },
          { code: 'permission', text: $t('system.role.setAPIPermissions') },
          { code: 'delete', text: $t('common.delete') },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 160,
    },
  ];
}
```

**关键技巧：**
- 使用 `cellRender` 配置单元格渲染方式
- `CellSwitch` 实现状态开关切换
- `CellOperation` 实现操作按钮组
- 使用国际化函数 `$t()` 实现多语言支持

---

## 二、表单开发技能

### 2.1 表单定义

```typescript
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
  ];
}
```

**关键技巧：**
- 使用 schema 方式定义表单字段
- 通过 `component` 指定组件类型
- `rules: 'required'` 配置必填验证
- `componentProps` 传递组件属性

### 2.2 表单组件选择使用逻辑

#### 2.2.1 组件选择决策指南

| 场景 | 推荐组件 | 使用说明 |
|------|---------|----------|
| 单行文本输入 | `Input` | 用户名、邮箱、简单描述等 |
| 多行文本输入 | `Textarea` | 备注、描述、内容等长文本 |
| 密码输入 | `Input.Password` | 密码、验证码等敏感信息 |
| 数字输入 | `InputNumber` | 数量、金额、年龄等数字类型 |
| 单选选择 | `RadioGroup` | 状态切换、类型选择等互斥选项（选项较少时） |
| 多选选择 | `CheckboxGroup` | 权限选择、标签多选等非互斥选项 |
| 下拉选择 | `Select` | 大量选项的选择（如部门、角色） |
| 日期选择 | `DatePicker` | 单个日期选择 |
| 日期范围 | `RangePicker` | 开始日期到结束日期的范围选择 |
| 开关切换 | `Switch` | 二值状态切换（启用/禁用） |
| 文件上传 | `Upload` | 图片、文件等上传场景 |
| 级联选择 | `Cascader` | 省市区联动、分类层级选择 |
| 自定义内容 | 自定义插槽 | 复杂表单元素（如权限树） |

#### 2.2.2 组件选择流程图

```
用户需求分析
    │
    ├─ 是否为文本输入？
    │     ├─ 单行短文本 → Input
    │     ├─ 多行长文本 → Textarea
    │     └─ 敏感信息 → Input.Password
    │
    ├─ 是否为数字输入？
    │     └─ 是 → InputNumber
    │
    ├─ 是否为选择类？
    │     ├─ 二选一且互斥 → RadioGroup / Switch
    │     ├─ 多选且选项少 → CheckboxGroup
    │     ├─ 多选且选项多 → Select(multiple)
    │     ├─ 单选且选项少 → RadioGroup
    │     ├─ 单选且选项多 → Select
    │     └─ 层级联动 → Cascader
    │
    ├─ 是否为日期时间？
    │     ├─ 单个日期 → DatePicker
    │     └─ 日期范围 → RangePicker
    │
    └─ 是否为文件上传？
          └─ 是 → Upload
```

#### 2.2.3 组件属性配置技巧

**Input 组件配置：**
```typescript
{
  component: 'Input',
  fieldName: 'username',
  label: '用户名',
  rules: ['required', { min: 3, max: 20, message: '用户名长度3-20字符' }],
  componentProps: {
    placeholder: '请输入用户名',
    disabled: false,
    maxLength: 20,
    showCount: true,
  },
}
```

**Select 组件配置：**
```typescript
{
  component: 'Select',
  fieldName: 'roleId',
  label: '角色',
  rules: 'required',
  componentProps: {
    placeholder: '请选择角色',
    allowClear: true,
    showSearch: true,
    options: [
      { label: '管理员', value: 1 },
      { label: '普通用户', value: 2 },
    ],
  },
}
```

**日期时间组件配置：**
```typescript
{
  component: 'DatePicker',
  fieldName: 'birthday',
  label: '出生日期',
  componentProps: {
    placeholder: '请选择日期',
    format: 'YYYY-MM-DD',
    showTime: false,
  },
}
```

**自定义插槽组件配置：**
```typescript
{
  component: 'Input',  // 使用 Input 作为占位组件
  fieldName: 'permissions',
  label: '权限分配',
  modelPropName: 'modelValue',  // 指定双向绑定属性名
  formItemClass: 'items-start',  // 自定义表单项样式
}
```

#### 2.2.4 验证规则配置

**常用验证规则：**
```typescript
{
  rules: 'required',  // 必填验证
  // 或
  rules: [
    'required',
    { type: 'email', message: '请输入正确邮箱' },
    { min: 6, max: 50, message: '长度6-50字符' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '只能包含字母和数字' },
  ],
}
```

**内置验证规则：**
| 规则名 | 说明 | 示例 |
|--------|------|------|
| `required` | 必填 | `rules: 'required'` |
| `email` | 邮箱格式 | `{ type: 'email' }` |
| `url` | URL格式 | `{ type: 'url' }` |
| `number` | 数字类型 | `{ type: 'number' }` |
| `min/max` | 长度限制 | `{ min: 3, max: 20 }` |
| `pattern` | 正则匹配 | `{ pattern: /^1[3-9]\d{9}$/ }` |

### 2.3 表单组件使用

```typescript
const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});
```

**关键技巧：**
- `useVbenForm` 返回表单实例和 API
- `showDefaultActions: false` 隐藏默认操作按钮

---

## 三、抽屉弹窗技能

### 3.1 抽屉初始化

```typescript
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
```

**关键技巧：**
- `connectedComponent` 指定抽屉内容组件
- `destroyOnClose: true` 关闭时销毁组件

### 3.2 抽屉事件处理

```typescript
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateRole(id.value, values) : createRole(values))
      .then(() => {
        message.success($t('common.saveSuccess'));
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});
```

**关键技巧：**
- `onConfirm` 处理确认提交逻辑
- `onOpenChange` 处理抽屉打开/关闭事件
- `drawerApi.lock()` 防止重复提交
- 使用 `nextTick` 确保 DOM 更新完成后再设置表单值

---

## 四、筛选表单技能

### 4.1 筛选表单定义

```typescript
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
    },
    { component: 'Input', fieldName: 'id', label: $t('system.role.id') },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('system.role.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'created_at',
      label: $t('system.role.createAt'),
    },
  ];
}
```

**关键技巧：**
- 使用 `RangePicker` 组件实现日期范围选择
- `allowClear: true` 允许清空选择

---

## 五、状态切换技能

### 5.1 状态开关处理

```typescript
async function onStatusChange(
  newStatus: number,
  row: SystemRoleApi.SystemRole,
) {
  const status: Recordable<string> = {
    0: '禁用',
    1: '启用',
  };
  try {
    await confirm(
      `你要将${row.name}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateRole(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}
```

**关键技巧：**
- 使用 `confirm` 弹窗确认操作
- 返回 `false` 中止状态切换
- 返回 `true` 允许状态切换

---

## 六、异步操作技能

### 6.1 删除操作

```typescript
function onDelete(row: SystemRoleApi.SystemRole) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteRole(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}
```

**关键技巧：**
- 使用 `message.loading` 显示加载状态
- `duration: 0` 手动控制关闭
- 使用相同的 `key` 替换消息

### 6.2 权限树加载

```typescript
async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getMenuList();
    permissions.value = res as unknown as DataNode[];
  } finally {
    loadingPermissions.value = false;
  }
}
```

**关键技巧：**
- 使用 try-finally 确保 loading 状态正确关闭
- 类型转换处理响应数据

---

## 七、组件通信技能

### 7.1 事件触发与监听

```typescript
const emits = defineEmits(['success']);

// 成功后触发事件
message.success($t('common.saveSuccess'));
emits('success');
```

**关键技巧：**
- 使用 `defineEmits` 定义事件
- 子组件通过 `emits` 触发事件
- 父组件通过 `@success="onRefresh"` 监听

---

## 八、国际化技能

### 8.1 多语言支持

```typescript
import { $t } from '#/locales';

// 使用国际化函数
title: $t('system.role.roleName'),
text: $t('common.edit'),
content: $t('ui.actionMessage.deleting', [row.name]),
```

**关键技巧：**
- 使用 `$t()` 函数实现文本国际化
- 支持参数传递 `$t('message', [param1, param2])`

---

## 九、最佳实践总结

### 9.1 代码组织
- 将表单 schema、表格列定义抽离到独立文件（如 `data.ts`）
- 组件职责单一化，列表页、表单页、权限页分离

### 9.2 错误处理
- 所有异步操作都有 catch 处理
- 使用 loading 状态反馈操作进度
- 操作失败时有友好的提示信息

### 9.3 用户体验
- 状态切换前二次确认
- 操作成功后自动刷新列表
- 表单验证即时反馈

### 9.4 性能优化
- `destroyOnClose: true` 避免内存泄漏
- 权限树数据按需加载（首次打开时加载）
- 表格使用虚拟滚动（`height: 'auto'`）

---

## 十、常用代码模板

### 10.1 表格模板

```typescript
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: useGridFormSchema() },
  gridOptions: {
    columns: useColumns(onActionClick),
    proxyConfig: {
      ajax: { query: async ({ page }, formValues) => api.fetch({ ...page, ...formValues }) },
    },
  },
});
```

### 10.2 抽屉模板

```typescript
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    drawerApi.lock();
    api.save(await formApi.getValues()).then(() => {
      message.success('保存成功');
      emits('success');
      drawerApi.close();
    }).catch(() => drawerApi.unlock());
  },
});
```

---

## 参考文件

- [角色列表页](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/list.vue)
- [角色表单](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/modules/form.vue)
- [数据定义](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/data.ts)
- [权限分配](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/modules/permission.vue)