import request from './request'

// ==================== 质控规则管理相关 API ====================

/**
 * 分页查询质控规则列表
 * @param {Object} params 查询参数
 */
export function getQualityRuleList(params) {
  return request({
    url: '/quality/rule/list',
    method: 'get',
    params
  })
}

/**
 * 获取质控规则详情
 * @param {number|string} id 规则ID
 */
export function getQualityRuleDetail(id) {
  return request({
    url: `/quality/rule/${id}`,
    method: 'get'
  })
}

/**
 * 新增质控规则
 * @param {Object} data 规则数据
 */
export function addQualityRule(data) {
  return request({
    url: '/quality/rule',
    method: 'post',
    data
  })
}

/**
 * 更新质控规则
 * @param {Object} data 规则数据（需包含 id）
 */
export function updateQualityRule(data) {
  return request({
    url: '/quality/rule',
    method: 'put',
    data
  })
}

/**
 * 删除质控规则（支持批量）
 * @param {string|number|Array<string|number>} ids 规则ID或ID数组
 */
export function deleteQualityRule(ids) {
  const idPath = Array.isArray(ids) ? ids.join(',') : ids
  return request({
    url: `/quality/rule/${idPath}`,
    method: 'delete'
  })
}

/**
 * 导出质控规则
 * @param {Object} params 查询参数
 */
export function exportQualityRule(params) {
  return request({
    url: '/quality/rule/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

/**
 * 导入质控规则
 * @param {FormData} formData 包含 file 字段的表单数据
 */
export function importQualityRule(formData) {
  return request({
    url: '/quality/rule/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

