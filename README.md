# WebGIS 呼市水质监测系统

基于 Vue.js 和 OpenLayers 开发的水质监测系统，提供水质数据可视化、空间分析、监测井管理和实时监控功能。

## 功能特点

### 1. 地图可视化
- 多源底图切换（天地图矢量、影像、地形）
- 水质分布图层展示（综合水质分布、单项参数分布）
- 监测井分布展示
- 项目边界范围显示
- 动态图例系统

### 2. 水质监测分析
- 综合水质分布分析
- 单项参数分析（pH值、总磷值等）
- 水质类别分类显示
- 实时数据监控
- 历史数据趋势分析

### 3. 监测井管理
- 监测井空间分布
- 监测井信息展示（井点编号、类型、成井时间等）
- 监测井结构图展示
- 监测井类别分类（国家级、省市级等）

### 4. 数据管理
- 监测数据管理
- 项目配置管理
- 质量规则配置
- 监测井管理
- 用户权限管理

### 5. 系统管理
- 项目管理
- 站点管理
- 用户管理
- 系统配置

### 6. 特色功能
- 自定义标记形状（支持21种形状类型，包括圆形带加号等）
- 动态图例系统（支持不同参数的自定义图例）
- 右侧固定信息面板
- 监测井结构图展示
- 实时数据图表（ECharts集成）
- 响应式设计（支持移动端适配）

## 技术栈

- Vue.js 2.6.14
- Element UI 2.15.6
- OpenLayers 10.5.0
- ECharts 5.2.2
- Axios 0.21.1
- Vue Router 3.5.3

## 安装说明

### 环境要求
- Node.js >= 12.x (推荐 18.12.1)
- npm >= 6.x

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd WebGis呼市水质监测系统/front
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run serve
```

4. 生产环境构建
```bash
npm run build
```

### Docker 部署

本项目支持 Docker 环境部署，使用 Node.js 18.12.1 版本。

#### 远程部署docker镜像
```bash
   # 拉取镜像
   docker pull lukesupercoder/water-quality-monitor:latest
   
   # 运行容器
   docker run -d -p 80:80 lukesupercoder/water-quality-monitor:latest
   
   # 或者使用docker-compose
   export DOCKER_USERNAME=你的用户名
   docker-compose up -d app-prod
```

#### 开发环境

```bash
# 启动开发环境
docker-compose up app-dev

# 后台运行
docker-compose up -d app-dev
```

#### 生产环境

```bash
# 构建并启动生产环境
docker-compose up --build app-prod

# 后台运行
docker-compose up -d app-prod

# 仅构建镜像
docker-compose build app-prod

# 停止服务
docker-compose down
```

#### 自定义配置

可通过修改 `docker-compose.yml` 文件自定义端口映射和环境变量。

## 项目结构

```
src/
├── api/                    # API接口定义
├── assets/                 # 静态资源
│   ├── data/              # 数据文件（GeoJSON等）
│   └── well.png           # 监测井结构图
├── components/             # 公共组件
│   ├── ScreenMap.vue      # 地图组件
│   ├── WaterQualityMenu.vue # 水质菜单组件
│   └── MonitoringDataPanel.vue # 监测数据面板
├── olmap/                  # OpenLayers地图封装
│   ├── core/              # 核心地图功能
│   ├── layerManage/       # 图层管理
│   ├── mapManage/         # 地图管理
│   └── popup/             # 弹窗组件
├── router/                 # 路由配置
└── views/                  # 页面组件
    ├── analysis/          # 分析页面
    ├── data-manage/       # 数据管理页面
    ├── system-manage/     # 系统管理页面
    ├── Monitor.vue        # 主监控页面
    └── Login.vue          # 登录页面
```

## 项目配置

### 开发环境配置
- 默认开发服务器端口：8080
- API 服务器地址：在 `.env` 文件中配置

### 生产环境配置
- 在 `.env.production` 文件中配置生产环境变量
- 可通过 `vue.config.js` 自定义构建配置

## 使用说明

### 1. 地图操作
- 底图切换：使用右上角工具栏的底图切换按钮
- 图层控制：通过左侧菜单控制水质分布图层显示
- 图例查看：地图左下角显示当前图层图例
- 地图控制：支持缩放、定位、全屏等操作

### 2. 水质监测功能
- 综合水质分布：点击查看整体水质状况
- 单项参数分析：选择pH值或总磷值进行专项分析
- 监测井分布：查看监测井空间分布和详细信息
- 项目边界：显示项目范围边界

### 3. 监测井信息
- 点击监测井标记查看详细信息
- 右侧面板显示井点编号、类型、成井时间等
- 监测井结构图展示
- 支持不同类别监测井的分类显示

### 4. 数据管理
- 监测数据看板：查看实时监测数据
- 数据过滤：按项目、监测井、时间范围筛选
- 数据导出：支持数据表格导出功能

## 注意事项

1. 确保后端API服务正常运行
2. 检查天地图密钥配置
3. 注意浏览器兼容性（推荐使用 Chrome 或 Firefox）
4. 监测井数据加载可能需要较长响应时间
5. 建议使用现代浏览器以获得最佳体验

## 开发团队

- 前端开发：[开发者信息]
- 技术支持：[支持团队信息]
- 联系方式：[联系方式]

## License

[授权信息]
