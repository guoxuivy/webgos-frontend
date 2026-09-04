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

## 八、树形组件开发技能

### 8.1 权限树组件使用

```typescript
const permissions = ref<DataNode[]>([]);
const checkedKeys = ref<TreeProps['checkedKeys']>([]);

// 加载权限数据
async function loadPermissions() {
  const permissionData = await getPermissions();
  permissions.value = permissionData.map(transformPermission);
}

// 递归转换权限数据格式
function transformPermission(permission): DataNode {
  return {
    ...permission,
    key: permission.key,
    children: permission.children?.map(transformPermission) || [],
  };
}
```

**关键技巧：**
- 使用递归函数处理树形数据转换
- 确保每个节点有 `key` 字段用于 Tree 组件识别
- `children` 字段用于构建层级结构

### 8.2 树形组件配置

```typescript
<Tree
  v-model:checkedKeys="checkedKeys"
  :tree-data="permissions"
  :field-names="{ children: 'children', title: 'name', key: 'key' }"
  checkable
  class="h-full overflow-auto"
  default-expand-all
  @check="onCheck"
>
  <template #title="{ description, name }">
    <span>{{ name }}</span>
    <span v-if="description" class="ml-2 text-xs text-gray-500">{{ description }}</span>
  </template>
</Tree>
```

**关键技巧：**
- `field-names` 配置字段映射关系
- `checkable` 启用复选框功能
- 使用插槽自定义节点渲染

### 8.3 表单插槽集成

```typescript
// data.ts 中定义表单字段
{
  component: 'Input',
  fieldName: 'menus',
  label: $t('system.role.permissions'),
  formItemClass: 'items-start',
}

// form.vue 中使用插槽
<Form>
  <template #menus="slotProps">
    <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
      <Tree
        :tree-data="permissions"
        multiple
        bordered
        :default-expanded-level="2"
        v-bind="slotProps"
        value-field="id"
        label-field="meta.title"
        icon-field="meta.icon"
      >
        <template #node="{ value }">
          <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
          {{ $t(value.meta.title) }}
        </template>
      </Tree>
    </Spin>
  </template>
</Form>
```

**关键技巧：**
- 使用 `#fieldName` 插槽自定义表单字段
- `slotProps` 包含表单绑定所需的属性
- 通过 `v-bind="slotProps"` 实现双向绑定

---

## 九、国际化技能

### 9.1 多语言支持

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

### 9.2 动态标题计算

```typescript
const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});
```

**关键技巧：**
- 使用 `computed` 动态计算标题
- 支持嵌套国际化调用

---

## 十、数据转换模式

### 10.1 API 响应数据转换

```typescript
async function loadPermissions() {
  const res = await getMenuList();
  permissions.value = res as unknown as DataNode[];
}
```

### 10.2 权限数据格式转换

```typescript
function transformPermission(permission: SystemPermissionApi.SystemPermission): DataNode {
  return {
    ...permission,
    key: permission.key,  // 适配 Tree 组件的 key 字段
    children: permission.children?.map(transformPermission) || [],  // 递归转换子节点
  };
}
```

**关键技巧：**
- 使用展开运算符保留原有属性
- 递归处理嵌套数据结构
- 类型断言确保类型安全

---

## 十一、最佳实践总结

### 11.1 代码组织
- 将表单 schema、表格列定义抽离到独立文件（如 `data.ts`）
- 组件职责单一化，列表页、表单页、权限页分离
- 使用组合式函数（useXxx）封装可复用逻辑
- 类型定义统一管理，提升代码可维护性

### 11.2 错误处理
- 所有异步操作都有 catch 处理
- 使用 loading 状态反馈操作进度
- 操作失败时有友好的提示信息
- 使用 try-finally 确保资源正确释放

### 11.3 用户体验
- 状态切换前二次确认（confirm 弹窗）
- 操作成功后自动刷新列表
- 表单验证即时反馈
- 按钮禁用状态防止重复提交（drawerApi.lock()）

### 11.4 性能优化
- `destroyOnClose: true` 避免内存泄漏
- 权限树数据按需加载（首次打开时加载）
- 表格使用虚拟滚动（`height: 'auto'`）
- 数据转换使用递归函数处理树形结构

### 11.5 类型安全
- 使用 TypeScript 泛型增强类型推断
- 类型断言确保 API 响应数据类型正确
- 定义明确的接口类型（如 `SystemRoleApi.SystemRole`）

---

## 十二、常用代码模板

### 12.1 表格模板

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

### 12.2 抽屉模板

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

### 12.3 树形权限组件模板

```typescript
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!formData.value) return;
    drawerApi.lock();
    try {
      // 仅保留真实权限键（path#method，含 #），剔除树形中间虚拟节点（v: 前缀）
      let perm_keys = Array.isArray(checkedKeys.value)
        ? (checkedKeys.value as string[])
        : [];
      perm_keys = perm_keys.filter((k) => typeof k === 'string' && k.includes('#'));
      await assignMenuPermissions({
        menu_id: Number(formData.value.id),
        perm_keys,
      });
      message.success($t('common.saveSuccess'));
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
});
```

### 12.4 表单插槽自定义模板

```typescript
<Form>
  <template #fieldName="slotProps">
    <CustomComponent v-bind="slotProps" />
  </template>
</Form>
```

---

## 十三、API 层设计技能

### 13.1 Namespace 接口定义

```typescript
export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: number;
    name: string;
    menus: SystemMenuApi.SystemMenu[];
    menu_ids: number[];
    remark: string;
    status: 0 | 1;
  }
}
```

**关键技巧：**
- 使用 `namespace` 组织相关接口类型
- `[key: string]: any` 允许动态属性扩展
- 联合类型 `0 | 1` 约束枚举值

### 13.2 请求客户端封装

```typescript
import { requestClient } from '#/api/request';

async function getRoleList(params: Recordable<any>) {
  return requestClient.get<{
    items: Array<SystemRoleApi.SystemRole>;
    total: number;
  }>('/api/rbac/roles', { params });
}
```

**关键技巧：**
- 统一使用 `requestClient` 处理请求
- 泛型定义响应数据结构
- 集中导出 API 函数

### 13.3 扁平数据转树形结构

```typescript
function convertPermissionsToTree(
  permissions: Array<SystemPermissionApi.SystemPermission>,
): Array<SystemPermissionApi.SystemPermission> {
  const permissionMap = new Map<string, SystemPermissionApi.SystemPermission>();
  const rootPermissions: Array<SystemPermissionApi.SystemPermission> = [];
  const tempNodes: Record<string, SystemPermissionApi.SystemPermission> = {};

  permissions.forEach((permission) => {
    // 权限 key 形如 path#method（如 /api/menu/:id#GET），按最后一个 # 拆分为路径与方法
    const hashIndex = permission.key.lastIndexOf('#');
    const path = hashIndex >= 0 ? permission.key.slice(0, hashIndex) : permission.key;
    const method = hashIndex >= 0 ? permission.key.slice(hashIndex + 1) : '';
    // 路径按 / 拆分，方法作为末段；虚拟中间节点使用 v: 前缀键
    const parts = path.split('/').filter(Boolean).concat(method ? [method] : []);

    for (let i = 0; i < parts.length; i++) {
      const nodePath = parts.slice(0, i + 1).join('/');
      if (!tempNodes[nodePath]) {
        tempNodes[nodePath] =
          i === parts.length - 1
            ? { ...permission, children: [] } // 叶子节点，key 为真实权限键 path#method
            : { key: `v:${nodePath}`, name: nodePath, children: [], isVirtual: true };
      }
    }
  });

  // 按层级拼接父子关系后交给 optimizeTree 折叠单子节点的虚拟节点
  return optimizeTree(rootPermissions);
}
```

**关键技巧：**
- 使用 `Map` / 对象快速查找节点
- 权限 key 形如 `path#method`，按最后一个 `#` 拆分为路径与方法，路径再按 `/` 拆分（`:` 视为普通路径段，避免 `/api/menu/:POST` 与 `/api/menu:POST` 被错误合并）
- 中间虚拟节点使用 `v:` 前缀键，真实权限键为 `path#method`（含 `#`），便于提交时过滤

### 13.4 树形结构优化

```typescript
function optimizeTree(
  tree: Array<SystemPermissionApi.SystemPermission>,
): Array<SystemPermissionApi.SystemPermission> {
  const optimizedTree: Array<SystemPermissionApi.SystemPermission> = [];
  tree.forEach((node) => {
    const optimizedChildren = optimizeTree(node.children ?? []);
    const optimizedNode = { ...node, children: optimizedChildren };

    // 仅当当前节点是虚拟节点（isVirtual）且只有一个子节点时省略该节点
    if (optimizedChildren.length === 1 && (optimizedNode as any).isVirtual) {
      const only = optimizedChildren[0];
      if (only) optimizedTree.push(only);
    } else {
      optimizedTree.push(optimizedNode);
    }
  });

  return optimizedTree;
}
```

**关键技巧：**
- 递归优化子树结构
- 省略只有一个子节点的虚拟节点（isVirtual）
- 简化树形展示层级

---

## 十四、高级技巧

### 14.1 权限键过滤处理

```typescript
// 仅保留真实权限键（path#method，含 #），剔除树形中间虚拟节点（v: 前缀）
let perm_keys = Array.isArray(checkedKeys.value)
  ? (checkedKeys.value as string[])
  : [];
perm_keys = perm_keys.filter((k) => typeof k === 'string' && k.includes('#'));
```

**应用场景：** 树形权限组件由真实权限键（`path#method`）与 `v:` 前缀的虚拟中间节点混合组成，提交绑定（如 `assignMenuPermissions`）时仅保留含 `#` 的真实权限键。

### 14.2 异步数据加载策略

```typescript
async onOpenChange(isOpen) {
  if (isOpen) {
    const data = drawerApi.getData<SystemRoleApi.SystemRole>();
    // 按需加载：只有首次打开时才加载权限数据
    if (permissions.value.length === 0) {
      await loadPermissions();
    }
    await nextTick();
    if (data) {
      formApi.setValues(data);
    }
  }
}
```

**关键技巧：** 
- 使用条件判断实现按需加载
- `nextTick` 确保 DOM 更新后再设置表单值

### 14.3 自定义图标渲染

```typescript
<Tree
  :tree-data="permissions"
  icon-field="meta.icon"
>
  <template #node="{ value }">
    <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
    {{ $t(value.meta.title) }}
  </template>
</Tree>
```

**关键技巧：** 使用 `icon-field` 指定图标字段，通过插槽自定义渲染。

### 14.4 多抽屉协同管理

```typescript
// 表单抽屉
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 权限分配抽屉
const [PermissionDrawer, permissionDrawerApi] = useVbenDrawer({
  connectedComponent: Permission,
  destroyOnClose: true,
});

// 操作分发
function onActionClick(e: OnActionClickParams<SystemRoleApi.SystemRole>) {
  switch (e.code) {
    case 'edit': formDrawerApi.setData(row).open(); break;
    case 'permission': permissionDrawerApi.setData(row).open(); break;
    case 'delete': onDelete(row); break;
  }
}
```

**关键技巧：**
- 一个页面可管理多个抽屉
- 通过 `connectedComponent` 绑定内容组件
- 操作码分发不同抽屉

### 14.5 Modal.confirm 的 Promise 封装

```typescript
function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() { reject(new Error('已取消')); },
      onOk() { resolve(true); },
      title,
    });
  });
}

// 使用
await confirm('确定要删除吗？', '确认操作');
```

**关键技巧：**
- 将回调式 API 转换为 Promise
- 支持 async/await 语法
- 统一错误处理

---

## 十五、表单高级配置

### 15.1 自定义绑定属性

```typescript
{
  component: 'Input',
  fieldName: 'menus',
  formItemClass: 'items-start',
  label: $t('system.role.setPermissions'),
  modelPropName: 'modelValue',  // 自定义 v-model 属性名
}
```

**关键技巧：**
- `modelPropName` 指定双向绑定的属性名
- 适用于自定义组件的集成

### 15.2 日期格式化显示

```typescript
{
  field: 'created_at',
  formatter: ({ cellValue }) => formatDateTime(cellValue),
  title: $t('system.role.createAt'),
  width: 200,
}
```

**关键技巧：**
- `formatter` 函数格式化单元格数据
- 使用工具函数统一日期格式

---

## 参考文件

- [角色列表页](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/list.vue)
- [角色表单](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/modules/form.vue)
- [数据定义](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/data.ts)
- [权限分配](file:///d:/Goroot/webgos/frontend/apps/web-admin/src/views/system/role/modules/permission.vue)