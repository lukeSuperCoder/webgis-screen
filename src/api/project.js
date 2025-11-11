import request from './request'

// 项目管理相关API

/**
 * 获取项目列表（分页查询）
 * @param {Object} params - 查询参数
 * @param {string} [params.companyCode] - 企业编码
 * @param {string} [params.companyName] - 企业名称
 * @param {string} [params.geom] - 几何信息
 * @param {number} [params.id] - 项目ID
 * @param {string} [params.manager] - 负责人
 * @param {string} [params.projectCode] - 项目编码
 * @param {string} [params.projectType] - 项目类型
 * @param {string} [params.storageTime] - 入库时间 (date-time格式: yyyy-MM-ddTHH:mm:ss)
 * @param {number} [params.pageNum=1] - 页码，默认1
 * @param {number} [params.pageSize=10] - 每页大小，默认10
 * @returns {Promise} 返回分页数据 { code, msg, rows, total }
 * @example
 * getProjectList({ pageNum: 1, pageSize: 20, projectCode: 'PROJECT-001' })
 */
export function getProjectList(params) {
  return request({
    url: '/project/list',
    method: 'get',
    params
  })
}

/**
 * 获取项目详情
 * ⚠️ 注意：此接口在OpenAPI文档中未定义，后端未实现，已禁用
 * @deprecated 此接口已被禁用，因为后端未实现。如需使用，请先让后端实现此接口并在OpenAPI文档中定义。
 * 目前可以通过 GET /project/list 接口查询项目列表，然后通过 id 过滤获取单个项目信息
 */
// export function getProjectInfo(projectId) {
//   return request({
//     url: `/project/${projectId}`,
//     method: 'get'
//   })
// }

/**
 * 添加项目（插入单个项目数据）
 * @param {Object} data - 项目数据
 * @param {string} data.projectCode - 项目编码
 * @param {string} data.projectType - 项目类型
 * @param {string} data.manager - 负责人
 * @param {string} data.companyCode - 企业编码
 * @param {string} data.companyName - 企业名称
 * @param {string} [data.storageTime] - 入库时间 (date-time格式: yyyy-MM-ddTHH:mm:ss)
 * @param {string} [data.geom] - 几何信息
 * @returns {Promise} 返回添加结果 { code, msg, data }
 */
export function addProject(data) {
  return request({
    url: '/project',
    method: 'post',
    data
  })
}

/**
 * 更新项目信息
 * @param {Object} data - 项目数据（需包含id）
 * @param {number} data.id - 项目ID（必填）
 * @param {string} [data.projectCode] - 项目编码
 * @param {string} [data.projectType] - 项目类型
 * @param {string} [data.manager] - 负责人
 * @param {string} [data.companyCode] - 企业编码
 * @param {string} [data.companyName] - 企业名称
 * @param {string} [data.storageTime] - 入库时间 (date-time格式: yyyy-MM-ddTHH:mm:ss)
 * @param {string} [data.geom] - 几何信息
 * @returns {Promise} 返回更新结果 { code, msg, data }
 */
export function updateProject(data) {
  return request({
    url: '/project',
    method: 'put',
    data
  })
}

/**
 * 删除项目
 * ⚠️ 注意：此接口在OpenAPI文档中未定义，后端未实现，已禁用
 * @deprecated 此接口已被禁用，因为后端未实现。如需使用，请先让后端实现此接口并在OpenAPI文档中定义。
 */
// export function deleteProject(projectIds) {
//   return request({
//     url: '/project',
//     method: 'delete',
//     data: projectIds
//   })
// }

/**
 * 获取所有企业名称
 * @returns {Promise} 返回企业名称列表 { code, msg, data }
 * @example
 * getCompanyNames()
 */
export function getCompanyNames() {
  return request({
    url: '/project/companyNames',
    method: 'get'
  })
}

/**
 * 导入Shapefile数据（上传项目边界）
 * @param {FormData} formData - 包含Shapefile文件的表单数据
 * @param {string} projectCode - 项目编号（必填）
 * @returns {Promise} 返回导入结果 { code, msg, data }
 * @example
 * const formData = new FormData()
 * formData.append('file', file)
 * importShpData(formData, 'PROJECT-001')
 */
export function importShpData(formData, projectCode) {
  return request({
    url: '/project/importShp',
    method: 'post',
    params: {
      projectCode: projectCode
    },
    data: formData
    // 注意：不要手动设置 Content-Type，让 axios 自动处理 FormData
    // axios 会自动设置正确的 Content-Type: multipart/form-data; boundary=...
  })
}
