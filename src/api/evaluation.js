import request from './request'

// ==================== 评价标准配置相关 API ====================

/**
 * 分页查询评价标准配置列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页数量
 * @param {number|string} [params.referenceStandardId] 参考标准ID
 * @param {string} [params.metricName] 指标名称
 * @param {string} [params.metricCode] 指标编码
 * @param {number|string} [params.status] 状态（0-停用，1-启用）
 */
export function getEvaluationConfigList(params) {
  return request({
    url: '/evaluation/config/list',
    method: 'get',
    params
  })
}

/**
 * 新增评价标准配置
 * @param {Object} data 配置数据
 */
export function addEvaluationConfig(data) {
  return request({
    url: '/evaluation/config/add',
    method: 'post',
    data
  })
}

/**
 * 更新评价标准配置
 * @param {Object} data 配置数据（需包含 id）
 */
export function updateEvaluationConfig(data) {
  return request({
    url: '/evaluation/config/update',
    method: 'put',
    data
  })
}

/**
 * 批量删除评价标准配置
 * @param {Array<number>|number|string} ids ID数组或单个ID
 */
export function batchDeleteEvaluationConfig(ids) {
  const payload = Array.isArray(ids) ? ids : [ids]
  return request({
    url: '/evaluation/config/batchDelete',
    method: 'delete',
    data: payload
  })
}

/**
 * 批量激活某参考标准下的评价标准配置
 * @param {number|string} referenceStandardId 参考标准ID
 */
export function batchActivateEvaluationConfig(referenceStandardId) {
  return request({
    url: '/evaluation/config/batchActivate',
    method: 'post',
    params: {
      referenceStandardId
    }
  })
}

/**
 * 导出评价标准配置
 * @param {Object} params 查询参数
 */
export function exportEvaluationConfig(params) {
  return request({
    url: '/evaluation/config/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

/**
 * 导入评价标准配置
 * @param {FormData} formData 表单数据（包含 file 字段）
 * @param {number|string} evaluationViewId 评价标准视图ID
 */
export function importEvaluationConfig(formData, evaluationViewId) {
  return request({
    url: '/evaluation/config/import',
    method: 'post',
    params: {
      evaluationViewId
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ==================== 评价标准视图（文件）相关 API ====================

/**
 * 分页查询评价标准视图列表
 * @param {Object} params 查询参数
 */
export function getEvaluationViewList(params) {
  return request({
    url: '/evaluation/view/list',
    method: 'get',
    params
  })
}

/**
 * 下载评价标准文件
 * @param {number|string} id 评价标准ID
 */
export function downloadEvaluationStandard(id) {
  return request({
    url: `/evaluation/view/download/${id}`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 导入评价标准文件
 * @param {FormData} formData 含有 file 的表单数据
 */
export function importEvaluationStandard(formData) {
  return request({
    url: '/evaluation/view/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 预览评价标准文件（返回文件流，用于创建 blob URL）
 * @param {number|string} id 评价标准ID
 * @returns {Promise<Blob>} 文件流
 */
export function previewEvaluationStandard(id) {
  return request({
    url: `/evaluation/view/preview/${id}`,
    method: 'get',
    responseType: 'blob'
  })
}

