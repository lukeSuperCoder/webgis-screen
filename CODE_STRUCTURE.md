# 呼和浩特水质监测系统 - 前端代码结构

## 项目结构

```
src/
├── components/           # 通用组件
│   └── PageLayout.vue   # 左侧菜单+内容区布局组件
├── views/               # 页面组件
│   ├── analysis/        # 评价分析模块
│   │   ├── index.vue                    # 评价分析主页面（包含左侧菜单）
│   │   ├── standards.vue                # 评价标准查看
│   │   ├── standards-config.vue         # 评价标准配置
│   │   ├── comprehensive.vue            # 综合评价分析
│   │   ├── single-site-multi-factor.vue # 单站点多要素分析
│   │   ├── single-site-comparison.vue   # 单站点同环比分析
│   │   └── multi-site-single-factor.vue # 多站点单要素分析
│   ├── data-manage/     # 数据管理模块
│   │   ├── index.vue                    # 数据管理主页面（包含左侧菜单）
│   │   ├── quality-rules.vue           # 数据质控规则
│   │   ├── well-management.vue          # 监测井数据管理
│   │   ├── monitoring-data.vue          # 监测数据管理
│   │   └── project-config.vue          # 监测项目数据管理
│   ├── system-manage/   # 系统管理模块
│   │   ├── index.vue                    # 系统管理主页面（包含左侧菜单）
│   │   ├── user-management.vue          # 用户管理
│   │   ├── site-management.vue          # 站点信息管理
│   │   └── project-management.vue      # 监测项目配置
│   ├── Home.vue         # 主页面
│   ├── Login.vue        # 登录页面
│   ├── Monitor.vue      # 监测页面
│   └── user/            # 用户相关页面
│       └── UserManage.vue
└── router/
    └── index.js         # 路由配置
```

## 功能模块

### 1. 评价分析模块 (`/analysis`)
- **评价标准查看**: 查看当前水质评价标准
- **评价标准配置**: 配置水质评价标准参数
- **综合评价分析**: 进行综合水质评价分析
- **单站点多要素分析**: 分析单个监测站点的多要素数据
- **单站点同环比分析**: 对比分析单个站点的时间序列数据
- **多站点单要素分析**: 分析多个站点的单一要素数据

### 2. 数据管理模块 (`/data`)
- **数据质控规则**: 配置数据质量控制规则
- **监测井数据管理**: 管理监测井基础信息
- **监测数据管理**: 录入、查询和管理监测数据
- **监测项目数据管理**: 配置监测项目参数

### 3. 系统管理模块 (`/system`)
- **用户管理**: 管理系统用户账号和权限
- **站点信息管理**: 管理监测站点基础信息
- **监测项目配置**: 配置监测项目参数

## 技术特点

1. **模块化设计**: 每个功能模块独立文件夹，便于维护
2. **统一布局**: 使用 `PageLayout` 组件提供一致的左侧菜单+内容区布局
3. **路由嵌套**: 使用 Vue Router 的嵌套路由实现页面结构
4. **响应式设计**: 使用 Element UI 组件库，支持响应式布局
5. **数据模拟**: 各页面包含模拟数据，便于开发和测试

## 路由结构

```javascript
// 评价分析路由
/analysis -> 评价标准查看 (默认)
/analysis/standards -> 评价标准查看
/analysis/standards-config -> 评价标准配置
/analysis/comprehensive -> 综合评价分析
/analysis/single-site-multi-factor -> 单站点多要素分析
/analysis/single-site-comparison -> 单站点同环比分析
/analysis/multi-site-single-factor -> 多站点单要素分析

// 数据管理路由
/data -> 数据质控规则 (默认)
/data/quality-rules -> 数据质控规则
/data/well-management -> 监测井数据管理
/data/monitoring-data -> 监测数据管理
/data/project-config -> 监测项目数据管理

// 系统管理路由
/system -> 用户管理 (默认)
/system/user-management -> 用户管理
/system/site-management -> 站点信息管理
/system/project-management -> 监测项目配置
```

## 开发说明

1. 每个模块的主页面 (`index.vue`) 负责渲染左侧菜单和内容区
2. 子页面通过 `<router-view />` 在内容区显示
3. 所有页面都使用 Element UI 组件库
4. 数据目前为模拟数据，后续可接入真实 API
5. 页面支持增删改查等基本操作功能
