# WebGIS呼市水质监测系统 - API对比分析报告

## 文档信息
- **创建日期**: 2025年1月
- **版本**: v1.0
- **适用对象**: 前端开发AI模型
- **前置要求**: 已阅读项目整体分析报告

---

## 1. 概述

本报告对比分析了前端现有API调用实现与后端最新接口定义（水质监管项目更新版本-1105.openapi.json），识别差异点，为后续联调提供依据。

---

## 2. 核心业务API对比

### 2.1 监测井管理模块

#### 2.1.1 监测井空间查询
- **端点**: `GET /monitor/well/spatial`
- **前端实现**: `src/api/monitorWell.js` - `getMonitorWellSpatial()`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | minX | minX (最小经度) | minX (double) | ✅ 一致 |
  | minY | minY (最小纬度) | minY (double) | ✅ 一致 |
  | maxX | maxX (最大经度) | maxX (double) | ✅ 一致 |
  | maxY | maxY (最大纬度) | maxY (double) | ✅ 一致 |

- **响应格式**:
  ```javascript
  // 前端预期
  {
    code: 200,
    data: [
      {
        wellCode: "WELL-1000",
        longitude: 112.016666,
        latitude: 43.54075,
        geom: "POINT(112.016666 43.54075)", // WKT格式
        // ...其他字段
      }
    ]
  }
  ```

- **对接状态**: ✅ **已完成**，在 `Monitor.vue` 中使用
- **使用位置**: `src/views/Monitor.vue:104`

---

#### 2.1.2 监测井列表查询
- **端点**: `GET /monitor/well/list`
- **前端实现**: `getMonitorWellList()`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | wellCode | wellCode | wellCode (string) | ✅ 一致 |
  | projectId | projectId | projectId (string) | ✅ 一致 |
  | provinceCode | provinceCode | provinceCode (string) | ✅ 一致 |
  | cityCode | cityCode | cityCode (string) | ✅ 一致 |
  | countyCode | countyCode | countyCode (string) | ✅ 一致 |
  | completionTime | completionTime | completionTime (date-time) | ✅ 一致 |
  | pageNum | pageNum | pageNum (int32) | ✅ 一致 |
  | pageSize | pageSize | pageSize (int32) | ✅ 一致 |

- **响应格式**: 标准分页格式 `TableDataInfo`
  ```javascript
  {
    code: 200,
    rows: [...],  // 数据行
    total: 100    // 总数
  }
  ```

- **对接状态**: ✅ **已完成**
- **使用位置**: `src/views/data-manage/well-management.vue`

---

#### 2.1.3 监测井详情查询
- **端点**: `GET /monitor/well/{wellCode}`
- **前端实现**: `getMonitorWellInfo(wellCode)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | wellCode | 路径参数 | 路径参数 (string) | ✅ 一致 |

- **对接状态**: ✅ **已完成**
- **使用位置**: `src/components/ScreenMap.vue:415` (点击监测井标记时调用)

---

#### 2.1.4 监测井新增/编辑
- **端点**:
  - `POST /monitor/well` (新增，前端未实现此端点)
  - `PUT /monitor/well` (更新)
- **前端实现**:
  - `addMonitorWell(data)`
  - `updateMonitorWell(data)`

- **⚠️ 重要差异**:
  - **后端更新接口**: 参数通过**query参数**传递（40+个query参数）+ 可选的request body (binary)
  - **前端实现**: 通过**request body (JSON)**传递对象

- **需要修正**:
  ```javascript
  // 当前实现 (src/api/monitorWell.js)
  export function updateMonitorWell(data) {
    return request({
      url: '/monitor/well',
      method: 'put',
      data: data  // ❌ 后端期望query参数
    })
  }

  // 应改为
  export function updateMonitorWell(data) {
    return request({
      url: '/monitor/well',
      method: 'put',
      params: data  // ✅ 使用params传递
    })
  }
  ```

- **字段对比**: 共40+个字段，主要包括:
  - wellCode (监测井编码)
  - projectId (项目ID)
  - provinceCode, cityCode, countyCode (省市区代码)
  - longitude, latitude (经纬度)
  - geom (几何对象, WKT格式)
  - wellDepth (井深)
  - wellOwnershipUnit (井权属单位)
  - 多个布尔型字段（是否区域监测点、是否水源监测点等）

- **对接状态**: ⚠️ **部分完成** - 需要修改参数传递方式

---

#### 2.1.5 监测井删除
- **端点**: `DELETE /monitor/well/wellCodes` (前端API定义)
- **后端定义**: ⚠️ 在OpenAPI文档中未找到对应的DELETE端点
- **问题**:
  - 前端定义了 `deleteMonitorWell(wellCodes)` 方法
  - 后端OpenAPI文档中没有相应的DELETE接口
  - **需要确认**: 后端是否实现了此接口？或者需要前端调整？

---

#### 2.1.6 监测井导入
- **端点**: `POST /monitor/well/import`
- **前端实现**: `importMonitorWell(formData)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | file | FormData (multipart) | binary | ✅ 一致 |

- **Content-Type**: `multipart/form-data`
- **对接状态**: ✅ **已完成**
- **使用位置**: `src/views/data-manage/well-management.vue` (导入功能)

---

#### 2.1.7 监测井编码列表查询
- **端点**: `GET /monitor/well/wellCodes`
- **后端定义**: 查询所有监测井编号
- **前端实现**: ❌ **未定义**
- **建议**: 添加此API方法，用于下拉框数据源
  ```javascript
  // 建议在 src/api/monitorWell.js 中添加
  export function getMonitorWellCodes() {
    return request({
      url: '/monitor/well/wellCodes',
      method: 'get'
    })
  }
  ```

---

### 2.2 监测数据管理模块

#### 2.2.1 监测样本列表查询
- **端点**: `GET /monitor/sample/list`
- **前端实现**: `getSampleList(params)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | monitoringWellCode | monitoringWellCode | monitoringWellCode (string) | ✅ 一致 |
  | startTime | startTime | startTime (date-time) | ✅ 一致 |
  | endTime | endTime | endTime (date-time) | ✅ 一致 |
  | projectId | projectId | projectId (string) | ✅ 一致 |
  | pageNum | pageNum | pageNum (int32) | ✅ 一致 |
  | pageSize | pageSize | pageSize (int32) | ✅ 一致 |

- **响应格式**: 标准分页格式 `TableDataInfo`
- **对接状态**: ✅ **已完成**
- **使用位置**: `src/views/data-manage/monitoring-data.vue`

---

#### 2.2.2 监测数据导入
- **端点**: `POST /monitor/sample/import`
- **前端实现**: `importSampleData(formData)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | file | FormData (multipart) | binary | ✅ 一致 |

- **对接状态**: ✅ **已完成**

---

#### 2.2.3 监测数据查询（按监测井和时间）
- **端点**: `GET /monitor/sample/data`
- **前端实现**: `getSampleData(params)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | monitoringWellCode | monitoringWellCode | monitoringWellCode (string, required) | ✅ 一致 |
  | date | date | date (date-time, optional) | ✅ 一致 |

- **用途**: 获取指定监测井在指定时间的水质数据（所有指标）
- **响应数据**: 包含所有水质指标的完整数据
- **对接状态**: ⚠️ **已定义但未使用**
- **应用场景**:
  1. **Monitor.vue** - 替换 `well_data.json` 静态数据
  2. **ScreenMap.vue** - 点击监测井标记时显示实时数据
  3. **MonitoringDataPanel.vue** - 监测数据看板

---

#### 2.2.4 监测数据范围查询
- **端点**: `GET /monitor/sample/data/range`
- **前端实现**: `getSampleDataRange(params)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | monitoringWellCode | monitoringWellCode | monitoringWellCode (string, required) | ✅ 一致 |
  | startTime | startTime | startTime (date-time, required) | ✅ 一致 |
  | endTime | endTime | endTime (date-time, required) | ✅ 一致 |
  | metricName | metricName | metricName (string, required) | ✅ 一致 |

- **用途**: 查询指定时间范围内某个监测井的单项指标数据（用于趋势图）
- **对接状态**: ⚠️ **已定义但未使用**
- **应用场景**:
  - 单项参数趋势图（pH、总磷等）
  - 时间序列分析

---

#### 2.2.5 水质指标列表
- **端点**: `GET /monitor/sample/metrics`
- **前端实现**: `getSampleMetrics(params)`
- **对接状态**: ⚠️ **已定义但未使用**
- **建议用途**:
  - 动态获取可用的水质指标列表
  - 用于下拉框数据源
  - 替换硬编码的指标名称

---

#### 2.2.6 监测数据新增/编辑
- **前端引用**:
  ```javascript
  // src/views/data-manage/monitoring-data.vue:231
  import { addSampleData, updateSampleData } from '@/api/monitorData'
  ```
- **问题**: ❌ 这两个方法在 `src/api/monitorData.js` 中**未定义**
- **后端接口**: OpenAPI文档中也未找到对应的新增/更新接口
- **需要确认**:
  1. 后端是否提供了这些接口？
  2. 或者监测数据只能通过导入Excel的方式批量添加？

---

### 2.3 项目管理模块

#### 2.3.1 项目列表查询
- **端点**: `GET /project/list`
- **前端实现**: `getProjectList(params)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | projectCode | projectCode | projectCode (string) | ✅ 一致 |
  | companyName | companyName | companyName (string) | ✅ 一致 |
  | companyCode | companyCode | companyCode (string) | ✅ 一致 |
  | projectType | projectType | projectType (string) | ✅ 一致 |
  | manager | manager | manager (string) | ✅ 一致 |
  | storageTime | storageTime | storageTime (date-time) | ✅ 一致 |
  | geom | geom | geom (string) | ✅ 一致 |
  | pageNum | pageNum | pageNum (int32) | ✅ 一致 |
  | pageSize | pageSize | pageSize (int32) | ✅ 一致 |

- **对接状态**: ✅ **已完成**

---

#### 2.3.2 项目新增/编辑/删除
- **端点**:
  - `POST /project` (新增)
  - `PUT /project` (更新)
  - `DELETE /project` (删除) - ⚠️ OpenAPI文档中未找到
- **前端实现**:
  - `addProject(data)` - ✅ 通过request body (JSON)传递
  - `updateProject(data)` - ✅ 通过request body (JSON)传递
  - `deleteProject(projectIds)` - ⚠️ 后端接口未找到

- **对接状态**: ⚠️ 新增和更新已完成，删除接口需要确认

---

#### 2.3.3 公司名称列表
- **端点**: `GET /project/companyNames`
- **前端实现**: `getCompanyNames(params)`
- **对接状态**: ✅ **已完成**
- **使用场景**: 项目表单中的公司名称下拉框

---

#### 2.3.4 Shapefile导入
- **端点**: `POST /project/importShp`
- **前端实现**: `importShpData(formData, projectCode)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | projectCode | params.projectCode | query.projectCode (required) | ✅ 一致 |
  | file | FormData | binary | ✅ 一致 |

- **对接状态**: ✅ **已完成**

---

### 2.4 质控规则管理模块

#### 2.4.1 指标标准列表查询
- **端点**: `GET /monitor/metric/list`
- **前端实现**: `getMetricList(params)`
- **参数对比**:
  | 参数名 | 前端定义 | 后端定义 | 状态 |
  |--------|---------|---------|------|
  | metricCode | metricCode | metricCode (string) | ✅ 一致 |
  | qualityLevel | qualityLevel | qualityLevel (string) | ✅ 一致 |
  | pageNum | pageNum | pageNum (int32) | ✅ 一致 |
  | pageSize | pageSize | pageSize (int32) | ✅ 一致 |

- **对接状态**: ✅ **已完成**

---

#### 2.4.2 指标标准新增/编辑/删除
- **端点**:
  - `POST /monitor/metric` (新增)
  - `PUT /monitor/metric` (更新)
  - `DELETE /monitor/metric/{ids}` (删除)
- **前端实现**:
  - `addMetric(data)` - ✅
  - `updateMetric(data)` - ✅
  - `deleteMetric(ids)` - ✅

- **对接状态**: ✅ **已完成**

---

#### 2.4.3 指标编码列表
- **端点**: ⚠️ 前端定义为 `GET /monitor/metric/codes`
- **后端定义**: OpenAPI文档中未找到此端点
- **前端实现**: `getMetricCodes(metricCode)`
- **问题**: 接口定义不一致或后端未实现
- **需要确认**: 此接口的实际路径和参数

---

### 2.5 认证和用户管理模块

#### 2.5.1 用户登录
- **端点**: `POST /login`
- **前端实现**: `login(data)`
- **参数**:
  ```javascript
  {
    username: string,
    password: string
  }
  ```
- **响应**:
  ```javascript
  {
    code: 200,
    token: "Bearer xxx"
  }
  ```
- **对接状态**: ✅ **已完成**

---

#### 2.5.2 获取用户信息
- **端点**: `GET /getInfo`
- **前端实现**: `getUserInfo()`
- **对接状态**: ✅ **已完成**

---

#### 2.5.3 用户管理CRUD
- **端点**:
  - `GET /system/user/list` - 用户列表
  - `POST /system/user` - 新增用户
  - `PUT /system/user` - 更新用户
  - `DELETE /system/user/{userIds}` - 删除用户
  - 等共12个接口
- **前端实现**: `src/api/user.js` 中已定义全部接口
- **对接状态**: ⚠️ **API已定义，但页面未实现**
- **待完成**: `src/views/system-manage/user-management.vue` 需要开发

---

### 2.6 系统管理其他模块

#### 2.6.1 部门管理
- **端点**:
  - `GET /system/dept/list` - 部门列表
  - `POST /system/dept` - 新增部门
  - `PUT /system/dept` - 更新部门
  - `DELETE /system/dept/{deptId}` - 删除部门
  - `GET /system/dept/{deptId}` - 部门详情
  - `GET /system/dept/list/exclude/{deptId}` - 排除节点的部门列表
- **前端实现**: `src/api/systemDept.js` 中已定义部分接口
- **对接状态**: ⚠️ **API部分定义，页面未实现**

---

#### 2.6.2 字典管理
- **端点**:
  - 字典类型: `/system/dict/type/*` (6个接口)
  - 字典数据: `/system/dict/data/*` (7个接口)
- **前端实现**: `src/api/systemDict.js` 中已定义部分接口
- **对接状态**: ⚠️ **API部分定义，页面未实现**

---

#### 2.6.3 系统配置管理
- **端点**: `/system/config/*` (7个接口)
- **前端实现**: ❌ **API未定义**
- **后端提供**:
  - `GET /system/config/list` - 查询参数配置列表
  - `POST /system/config` - 新增参数配置
  - `PUT /system/config` - 修改参数配置
  - `DELETE /system/config/{configIds}` - 删除参数配置
  - `GET /system/config/{configId}` - 获取参数详情
  - `GET /system/config/configKey/{configKey}` - 根据参数键名查询
  - `POST /system/config/export` - 导出参数配置
  - `DELETE /system/config/refreshCache` - 刷新参数缓存

---

## 3. 响应格式标准化

### 3.1 成功响应格式
```javascript
{
  code: 200,        // 成功状态码
  msg: "操作成功",   // 消息
  data: {...}       // 数据（可选）
}
```

### 3.2 分页响应格式 (TableDataInfo)
```javascript
{
  code: 200,
  rows: [...],      // 数据行数组
  total: 100,       // 总记录数
  msg: "查询成功"
}
```

### 3.3 错误响应格式
```javascript
{
  code: 500,        // 错误状态码
  msg: "错误信息"
}
```

### 3.4 特殊状态码
- `200` / `0` - 成功
- `401` - 未授权（token失效）
- `403` - 禁止访问（无权限）
- `404` - 资源不存在
- `500` - 服务器错误

---

## 4. 关键差异总结

### 4.1 参数传递方式差异

| 接口 | 前端实现 | 后端期望 | 修复优先级 |
|------|---------|---------|-----------|
| PUT /monitor/well | data (body) | params (query) | 🔴 高 |

### 4.2 未实现的后端接口

| 接口 | 用途 | 优先级 |
|------|------|--------|
| GET /monitor/well/wellCodes | 获取所有监测井编号 | 🟡 中 |
| GET /monitor/sample/data | 获取监测井水质数据 | 🔴 高 |
| GET /monitor/sample/data/range | 获取时间范围内单项指标数据 | 🟡 中 |
| GET /monitor/sample/metrics | 获取所有水质指标 | 🟡 中 |
| 系统配置管理相关接口 | 系统参数配置 | 🟢 低 |

### 4.3 前端定义但后端缺失的接口

| 接口 | 前端定义 | 状态 | 处理方式 |
|------|---------|------|---------|
| DELETE /monitor/well/wellCodes | deleteMonitorWell() | ❌ 后端未找到 | 需与后端确认 |
| addSampleData() | 监测数据新增 | ❌ 前端引用但未定义 | 需与后端确认 |
| updateSampleData() | 监测数据更新 | ❌ 前端引用但未定义 | 需与后端确认 |
| DELETE /project | deleteProject() | ❌ 后端未找到 | 需与后端确认 |
| GET /monitor/metric/codes | getMetricCodes() | ❌ 后端未找到 | 需与后端确认 |

---

## 5. 数据格式特殊说明

### 5.1 WKT格式 (Well-Known Text)
- **字段**: `geom` (监测井、项目边界)
- **格式**: `"POINT(112.016666 43.54075)"`
- **前端处理**: 已实现WKT解析函数 `parsePointWKT()`
- **位置**: `src/components/ScreenMap.vue:89`

### 5.2 日期时间格式
- **后端格式**: ISO 8601 格式 `"2025-10-20T17:48:00"`
- **前端显示**: `"YYYY-MM-DD HH:mm:ss"`
- **转换**: 使用Element UI的DatePicker组件自动处理

### 5.3 省市区代码
- **存储**: 分别存储 provinceCode, cityCode, countyCode
- **前端组件**: 使用 `element-china-area-data` 库的级联选择器
- **数据绑定**: `regionCodes` 数组 `[provinceCode, cityCode, countyCode]`

---

## 6. 需要与后端确认的问题清单

1. **监测井删除接口** (`DELETE /monitor/well/wellCodes`) - 是否已实现？
2. **监测数据新增/编辑接口** - 是否提供？还是只能通过Excel导入？
3. **项目删除接口** (`DELETE /project`) - 是否已实现？
4. **指标编码查询接口** (`GET /monitor/metric/codes`) - 实际路径是什么？
5. **监测井更新接口参数传递方式** - 确认是query参数还是body参数？（OpenAPI定义为query）
6. **监测数据完整数据结构** - `GET /monitor/sample/data` 返回的具体字段有哪些？

---

## 7. 下一步行动计划

### 7.1 立即需要修复的问题
1. 修改 `updateMonitorWell()` 的参数传递方式（data → params）
2. 移除前端对未定义API的引用（addSampleData, updateSampleData）

### 7.2 待实现的核心功能
1. 地图监测页面对接实时水质数据（使用 `getSampleData()`）
2. 监测数据看板对接实时数据
3. 添加缺失的API方法（如 `getMonitorWellCodes()`）

### 7.3 待开发的页面
1. 用户管理页面（API已完成）
2. 系统配置管理页面
3. 部门管理、字典管理完善

---

## 8. 附录：API清单总览

### 8.1 已完全对接的API (✅)
- 用户登录、用户信息获取
- 监测井列表、详情、空间查询、导入
- 监测数据列表、导入
- 项目列表、新增、更新、公司名称查询、Shapefile导入
- 质控规则列表、新增、更新、删除

### 8.2 已定义但未使用的API (⚠️)
- 监测数据查询 (getSampleData)
- 监测数据范围查询 (getSampleDataRange)
- 水质指标列表 (getSampleMetrics)

### 8.3 需要修复的API (🔴)
- 监测井更新 (updateMonitorWell) - 参数传递方式

### 8.4 缺失的API (❌)
- 系统配置管理全套接口
- 部分删除接口
- 监测数据新增/编辑接口

---

**报告完成日期**: 2025年1月
**下一步**: 参考《地图监测页面前后端联调技术方案》开始实施
