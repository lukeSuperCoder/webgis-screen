import request from './request'

// 水源地信息管理相关 API

/**
 * 分页查询水源地列表
 * @param {Object} params - 查询参数与分页参数
 */
export function getWaterSourceList(params) {
  return request({
    url: '/waterSourceInfo/list',
    method: 'get',
    params
  })
}

/**
 * 根据水源ID查询详情
 * @param {number|string} sourceId - 水源ID
 */
export function getWaterSourceInfoById(sourceId) {
  return request({
    url: `/waterSourceInfo/${sourceId}`,
    method: 'get'
  })
}

/**
 * 新增水源地信息
 * @param {Object} data - 水源地数据
 */
export function addWaterSourceInfo(data) {
  return request({
    url: '/waterSourceInfo',
    method: 'post',
    data
  })
}

/**
 * 更新水源地信息
 * @param {Object} data - 水源地数据（JSON Body）
 */
export function updateWaterSourceInfo(data) {
  return request({
    url: '/waterSourceInfo',
    method: 'put',
    data
  })
}

/**
 * 导入水源地 Excel
 * @param {FormData} formData - 包含文件的表单数据
 */
export function importWaterSourceExcel(formData) {
  return request({
    url: '/waterSourceInfo/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传水源地边界 Shapefile
 * @param {FormData} formData - 包含文件的表单数据
 */
export function importWaterSourceShp(formData) {
  return request({
    url: '/waterSourceInfo/importShp',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量删除水源地信息
 * @param {Array<number>} sourceIds - 水源地ID数组
 * @returns {Promise} 返回删除结果 { code, msg, data }
 * @example
 * batchDeleteWaterSource([1, 2, 3])
 */
export function batchDeleteWaterSource(sourceIds) {
  return request({
    url: '/waterSourceInfo/batch',
    method: 'delete',
    data: sourceIds
  })
}

/**
 * 获取所有水源名称
 */
export function getWaterSourceNames() {
  return request({
    url: '/waterSourceInfo/sourceNames',
    method: 'get'
  })
}

/**
 * 空间范围内查询水源地
 * @param {Object} params - { minX, minY, maxX, maxY }
 */
export function getWaterSourceSpatial(params) {
  return request({
    url: '/waterSourceInfo/spatial',
    method: 'get',
    params
  })
}


