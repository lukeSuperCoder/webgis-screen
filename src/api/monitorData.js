import request from './request'

// 监测数据管理相关API

/**
 * 获取监测样本列表
 * @param {Object} params - 查询参数
 */
export function getSampleList(params) {
  return request({
    url: '/monitor/sample/list',
    method: 'get',
    params
  })
}

/**
 * 导入监测样本数据
 * @param {FormData} formData - 包含文件的表单数据
 */
export function importSampleData(formData) {
  return request({
    url: '/monitor/sample/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取监测样本指标
 * @param {Object} params - 查询参数
 */
export function getSampleMetrics(params) {
  return request({
    url: '/monitor/sample/metrics',
    method: 'get',
    params
  })
}

/**
 * 获取监测数据
 * @param {Object} params - 查询参数
 */
export function getSampleData(params) {
  return request({
    url: '/monitor/sample/data',
    method: 'get',
    params
  })
}

/**
 * 获取监测数据范围
 * @param {Object} params - 查询参数
 */
export function getSampleDataRange(params) {
  return request({
    url: '/monitor/sample/data/range',
    method: 'get',
    params
  })
}

/**
 * 获取检测指标列表
 * @param {Object} params - 查询参数
 */
export function getMetricList(params) {
  return request({
    url: '/monitor/metric/list',
    method: 'get',
    params
  })
}

/**
 * 添加检测指标
 * @param {Object} data - 指标数据
 */
export function addMetric(data) {
  return request({
    url: '/monitor/metric',
    method: 'post',
    data
  })
}

/**
 * 更新检测指标
 * @param {Object} data - 指标数据
 */
export function updateMetric(data) {
  return request({
    url: '/monitor/metric',
    method: 'put',
    data
  })
}

/**
 * 删除检测指标
 * @param {string|Array} metricIds - 指标ID或ID数组
 */
export function deleteMetric(metricIds) {
  return request({
    url: '/monitor/metric',
    method: 'delete',
    data: metricIds
  })
}
