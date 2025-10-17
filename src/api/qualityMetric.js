import request from './request'

// 检测指标管理API

/**
 * 分页查询指标标准
 * @param {Object} params 查询参数
 * @param {string} params.metricCode 指标编码
 * @param {string} params.qualityLevel 质量等级
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页记录数
 */
export function getMetricList(params) {
  return request({
    url: '/monitor/metric/list',
    method: 'get',
    params
  })
}

/**
 * 新增指标标准
 * @param {Object} data 指标标准数据
 * @param {string} data.metricCode 指标编码
 * @param {string} data.qualityLevel 质量等级
 * @param {string} data.relation 范围区间
 * @param {number} data.upperBound 上界值
 * @param {number} data.lowerBound 下界值
 */
export function addMetric(data) {
  return request({
    url: '/monitor/metric',
    method: 'post',
    data
  })
}

/**
 * 修改指标标准
 * @param {Object} data 指标标准数据
 * @param {number} data.id 指标标准ID
 * @param {string} data.metricCode 指标编码
 * @param {string} data.qualityLevel 质量等级
 * @param {string} data.relation 范围区间
 * @param {number} data.upperBound 上界值
 * @param {number} data.lowerBound 下界值
 */
export function updateMetric(data) {
  return request({
    url: '/monitor/metric',
    method: 'put',
    data
  })
}

/**
 * 删除指标标准
 * @param {string} ids 要删除的ID，多个用逗号分隔
 */
export function deleteMetric(ids) {
  return request({
    url: `/monitor/metric/${ids}`,
    method: 'delete'
  })
}

/**
 * 获取指标编码列表
 * @param {string} metricCode 指标编码（可选，用于搜索）
 */
export function getMetricCodes(metricCode = '') {
  return request({
    url: '/monitor/metric/codes',
    method: 'get',
    params: { metricCode }
  })
}
