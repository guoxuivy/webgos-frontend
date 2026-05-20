# Vue Vben Admin Web Admin

基于 Vue Vben Admin v5.5.9 构建的企业级后台管理系统前端应用。

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [配置说明](#配置说明)
- [核心功能](#核心功能)
- [开发指南](#开发指南)
- [部署说明](#部署说明)
- [命令汇总](#命令汇总)

## 项目概述

本项目是基于 **Vue Vben Admin** 的企业级后台管理系统前端应用，采用现代化技术栈，提供完善的权限管理、路由控制和丰富的 UI 组件。

## 技术栈

| 分类 | 技术 | 说明 |
| :--- | :--- | :--- |
| 框架 | Vue 3 | 渐进式 JavaScript 框架 |
| 语言 | TypeScript | 类型安全的 JavaScript |
| 构建工具 | Vite | 下一代前端构建工具 |
| 状态管理 | Pinia | Vue 官方状态管理库 |
| 路由 | Vue Router | Vue 官方路由管理器 |
| UI 组件 | Ant Design Vue | 企业级 UI 组件库 |
| 数据查询 | @tanstack/vue-query | 数据获取和缓存 |
| 图标 | @vben/icons | 统一图标库 |

## 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0

### 安装依赖

```bash
cd d:\Goroot\webgos\frontend\apps\web-admin
pnpm install
```

### 开发模式

```bash
pnpm dev
```

启动后访问: `http://localhost:5557`

### 生产构建

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

### 类型检查

```bash
pnpm typecheck
```

## 项目结构

```
src/
├── api/                    # API 接口层
│   ├── core/              # 核心 API（认证、用户、菜单）
│   ├── system/            # 系统管理 API
│   ├── examples/          # 示例 API
│   ├── index.ts           # API 导出入口
│   └── request.ts         # 请求客户端配置
├── router/                # 路由配置
│   ├── routes/            # 路由定义
│   │   ├── modules/       # 动态路由模块
│   │   ├── core.ts        # 核心路由
│   │   └── index.ts       # 路由导出
│   ├── access.ts          # 权限配置
│   ├── guard.ts           # 路由守卫
│   └── index.ts           # 路由实例
├── store/                 # 状态管理
│   └── auth.ts            # 认证状态
├── views/                 # 页面视图
│   ├── _core/             # 核心页面（登录、错误页）
│   ├── dashboard/         # 仪表盘
│   └── system/            # 系统管理
├── layouts/               # 布局组件
│   ├── basic.vue          # 基础布局
│   └── auth.vue           # 认证页面布局
├── locales/               # 国际化
│   └── langs/             # 语言包
├── adapter/               # 适配器（表单、表格等）
├── main.ts                # 应用入口
├── bootstrap.ts           # 启动引导
└── preferences.ts         # 偏好设置
```

## 配置说明

### 环境变量

项目使用 `.env.*` 文件管理环境变量：

| 配置项 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `VITE_APP_TITLE` | 应用标题 | Vben Web Admin |
| `VITE_APP_NAMESPACE` | 应用命名空间 | vben-web-admin |
| `VITE_APP_STORE_SECURE_KEY` | Store 加密密钥 | please-replace-me-with-your-own-key |
| `VITE_PORT` | 开发服务器端口 | 5557 |
| `VITE_GLOB_API_URL` | API 接口地址 | /api |
| `VITE_NITRO_MOCK` | 是否开启 Mock | false |

### 代理配置

开发环境下，`/api` 请求被代理到后端服务：

```typescript
// vite.config.mts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
    ws: true,
  },
}
```

## 核心功能

### 认证系统

登录流程：

1. 用户提交登录表单
2. 调用 `loginApi` 获取 accessToken
3. 设置 Token 到状态管理
4. 获取用户信息和权限码
5. 跳转到首页

**API 接口**:
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新 Token
- `POST /auth/logout` - 退出登录

### 路由系统

路由分为三类：
- **核心路由**: 无需权限验证（登录页、错误页）
- **动态路由**: 需要权限验证的业务页面
- **外部路由**: 用于内嵌在其他系统的页面

### 请求处理

请求客户端配置包含：
- 请求头自动添加 Token
- 响应数据自动解构
- Token 过期自动刷新
- 统一错误处理
- BigInt 数据转换

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/routes/modules/` 添加路由配置
3. 在 `src/api/` 添加对应的 API 接口

### 添加新 API

```typescript
// src/api/system/user.ts
import { requestClient } from '#/api/request';

export async function getUserList(params) {
  return requestClient.post('/api/user/list', params);
}
```

### 国际化

在 `src/locales/langs/` 目录下添加对应语言的翻译文件。

## 部署说明

### 构建产物

构建命令执行后，产物输出到 `dist/` 目录。

### 环境变量配置

生产环境配置文件: `.env.production`

```env
VITE_APP_TITLE=Vben Web Admin
VITE_GLOB_API_URL=http://your-api-server.com
```

## 命令汇总

| 命令 | 说明 |
| :--- | :--- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm build:analyze` | 构建分析 |
| `pnpm preview` | 预览构建结果 |
| `pnpm typecheck` | TypeScript 类型检查 |

## 注意事项

1. **后端服务**: 开发时确保后端服务运行在 `http://localhost:8080`
2. **密钥安全**: 生产环境务必修改 `VITE_APP_STORE_SECURE_KEY`
3. **权限码**: 首次登录需要确保后端已配置好权限点数据