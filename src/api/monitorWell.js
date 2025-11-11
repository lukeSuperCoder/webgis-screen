import request from './request'

// 监测井管理相关API

/**
 * 监测井空间查询
 * @param {Object} params - 查询参数
 * @param {number} params.minX - 最小经度
 * @param {number} params.minY - 最小纬度
 * @param {number} params.maxX - 最大经度
 * @param {number} params.maxY - 最大纬度
 */
export function getMonitorWellSpatial(params) {
  return request({
    url: '/monitor/well/spatial',
    method: 'get',
    params
  })
}

/**
 * 获取监测井列表
 * @param {Object} params - 查询参数
 */
export function getMonitorWellList(params) {
  return request({
    url: '/monitor/well/list',
    method: 'get',
    params
  })
}

/**
 * 根据井编码查询监测井详细信息
 * @param {string} wellCode - 井编码
 */
export function getMonitorWellInfo(wellCode) {
  return request({
    url: `/monitor/well/${wellCode}`,
    method: 'get'
  })
}

/**
 * 添加监测井
 * @param {Object} data - 监测井数据
 */
export function addMonitorWell(data) {
  return request({
    url: '/monitor/well',
    method: 'post',
    data
  })
}

/**
 * 更新监测井
 * @param {Object} data - 监测井数据（通过query参数传递）
 */
export function updateMonitorWell(data) {
  // 构建请求参数,移除辅助字段
  const params = { ...data }
  delete params.regionCodes  // 删除前端辅助字段,只传递provinceCode、cityCode、countyCode

  return request({
    url: '/monitor/well',
    method: 'put',
    params  // 使用params传递query参数
  })
}

/**
 * 删除监测井
 * @param {string|Array} wellCodes - 井编码或井编码数组
 */
export function deleteMonitorWell(wellCodes) {
  return request({
    url: '/monitor/well/wellCodes',
    method: 'delete',
    data: wellCodes
  })
}

/**
 * 导入监测井数据
 * @param {FormData} formData - 包含文件的表单数据
 */
export function importMonitorWell(formData) {
  return request({
    url: '/monitor/well/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取所有监测井编号
 * @returns {Promise} 返回监测井编号列表
 */
export function getMonitorWellCodes() {
  return request({
    url: '/monitor/well/wellCodes',
    method: 'get'
  })
}
