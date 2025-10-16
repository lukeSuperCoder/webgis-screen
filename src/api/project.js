import request from './request'

// 项目管理相关API

/**
 * 获取项目列表
 * @param {Object} params - 查询参数
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
 * @param {string|number} projectId - 项目ID
 */
export function getProjectInfo(projectId) {
  return request({
    url: `/project/${projectId}`,
    method: 'get'
  })
}

/**
 * 添加项目
 * @param {Object} data - 项目数据
 */
export function addProject(data) {
  return request({
    url: '/project',
    method: 'post',
    data
  })
}

/**
 * 更新项目
 * @param {Object} data - 项目数据
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
 * @param {string|Array} projectIds - 项目ID或ID数组
 */
export function deleteProject(projectIds) {
  return request({
    url: '/project',
    method: 'delete',
    data: projectIds
  })
}

/**
 * 获取公司名称列表
 * @param {Object} params - 查询参数
 */
export function getCompanyNames(params) {
  return request({
    url: '/project/companyNames',
    method: 'get',
    params
  })
}

/**
 * 导入Shapefile数据
 * @param {FormData} formData - 包含Shapefile文件的表单数据
 */
export function importShpData(formData) {
  return request({
    url: '/project/importShp',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
