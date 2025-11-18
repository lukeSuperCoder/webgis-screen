import request from './request'

// 污染物指标管理 API

/**
 * 查询污染物指标列表
 * @param {Object} params 查询参数
 */
export function listPollutionMetrics(params) {
  return request({
    url: '/pollution/metric/list',
    method: 'get',
    params
  })
}

/**
 * 新增污染物指标
 * @param {Object} data 污染物指标数据
 */
export function addPollutionMetric(data) {
  return request({
    url: '/pollution/metric',
    method: 'post',
    data
  })
}

/**
 * 更新污染物指标
 * @param {Object} data 污染物指标数据
 */
export function updatePollutionMetric(data) {
  return request({
    url: '/pollution/metric',
    method: 'put',
    data
  })
}

/**
 * 删除污染物指标
 * @param {string|number} ids 待删除的指标ID（可逗号分隔）
 */
export function deletePollutionMetrics(ids) {
  return request({
    url: `/pollution/metric/${ids}`,
    method: 'delete'
  })
}

/**
 * 获取污染物指标详情
 * @param {number} id 指标ID
 */
export function getPollutionMetric(id) {
  return request({
    url: `/pollution/metric/${id}`,
    method: 'get'
  })
}

/**
 * 导入污染物指标
 * @param {FormData} formData 包含文件的FormData
 */
export function importPollutionMetrics(formData) {
  return request({
    url: '/pollution/metric/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出污染物指标
 * @param {Object} params 查询参数，同列表接口
 */
export function exportPollutionMetrics(params) {
  return request({
    url: '/pollution/metric/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

