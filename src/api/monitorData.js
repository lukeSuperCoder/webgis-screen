import request from './request'

// ==================== 监测数据管理相关API ====================

/**
 * 获取监测样本列表（分页查询）
 * @param {Object} params - 查询参数
 * @param {string} [params.monitoringWellCode] - 监测井编号
 * @param {string} [params.startTime] - 开始时间 (格式: yyyy-MM-dd HH:mm:ss)
 * @param {string} [params.endTime] - 结束时间 (格式: yyyy-MM-dd HH:mm:ss)
 * @param {string} [params.projectId] - 项目编号
 * @param {number} [params.pageNum=1] - 页码，默认1
 * @param {number} [params.pageSize=10] - 每页大小，默认10
 * @returns {Promise} 返回分页数据 { code, msg, rows, total }
 * @example
 * getSampleList({ pageNum: 1, pageSize: 20, monitoringWellCode: 'WELL-1000' })
 */
export function getSampleList(params) {
  return request({
    url: '/monitor/sample/list',
    method: 'get',
    params
  })
}

/**
 * 导入监测样本数据（Excel文件上传）
 * @param {FormData} formData - 包含文件的表单数据，必须包含file字段
 * @returns {Promise} 返回导入结果 { code, msg, data }
 * @example
 * const formData = new FormData()
 * formData.append('file', file)
 * importSampleData(formData)
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
 * 获取所有水质指标列表
 * @param {Object} [params] - 查询参数（可选）
 * @returns {Promise} 返回指标列表 { code, msg, data }
 * @example
 * getSampleMetrics()
 */
export function getSampleMetrics(params) {
  return request({
    url: '/monitor/sample/metrics',
    method: 'get',
    params
  })
}

/**
 * 获取监测井的水质数据
 * @param {Object} params - 查询参数
 * @param {string} params.monitoringWellCode - 监测井编号（必填）
 * @param {string} [params.date] - 时间(默认当前时间)，格式: yyyy-MM-dd HH:mm:ss，会返回该监测井离date最近的一个采样时间的数据
 * @returns {Promise} 返回监测井的水质数据 { code, msg, data }
 * @example
 * getSampleData({ monitoringWellCode: 'WELL-1000', date: '2025-01-20 17:48:00' })
 */
export function getSampleData(params) {
  return request({
    url: '/monitor/sample/data',
    method: 'get',
    params
  })
}

/**
 * 获取监测数据范围（查询指定时间范围内监测井的单项指标数据）
 * @param {Object} params - 查询参数
 * @param {string} params.monitoringWellCode - 监测井编号（必填）
 * @param {string} params.startTime - 开始时间，格式: yyyy-MM-dd HH:mm:ss（必填）
 * @param {string} params.endTime - 结束时间，格式: yyyy-MM-dd HH:mm:ss（必填）
 * @param {string} params.metricName - 指标名称（必填）
 * @returns {Promise} 返回时间序列数据 { code, msg, data }
 * @example
 * getSampleDataRange({
 *   monitoringWellCode: 'WELL-1000',
 *   startTime: '2025-01-01 00:00:00',
 *   endTime: '2025-01-31 23:59:59',
 *   metricName: 'pH值'
 * })
 */
export function getSampleDataRange(params) {
  return request({
    url: '/monitor/sample/data/range',
    method: 'get',
    params
  })
}

/**
 * 获取监测井指标的质量等级信息
 * @param {Object} params - 查询参数
 * @param {string} params.monitoringWellCode - 监测井编号（必填）
 * @param {string} [params.startTime] - 开始时间，格式: yyyy-MM-dd HH:mm:ss（可选）
 * @param {string} [params.endTime] - 结束时间，格式: yyyy-MM-dd HH:mm:ss（可选）
 * @returns {Promise} 返回质量等级数据 { code, msg, data }
 * @example
 * getSampleQualityLevels({
 *   monitoringWellCode: '152501J0001',
 *   startTime: '2021-08-01 00:00:00',
 *   endTime: '2021-08-31 23:59:59'
 * })
 */
export function getSampleQualityLevels(params) {
  return request({
    url: '/monitor/sample/quality-levels',
    method: 'get',
    params
  })
}

/**
 * 新增监测样本数据
 * ⚠️ 注意：此接口在OpenAPI文档中未定义，后端未实现，已禁用
 * @deprecated 此接口已被禁用，因为后端未实现。如需使用，请先让后端实现此接口并在OpenAPI文档中定义。
 */
// export function addSampleData(data) {
//   return request({
//     url: '/monitor/sample',
//     method: 'post',
//     data
//   })
// }

/**
 * 更新监测样本数据
 * ⚠️ 注意：此接口在OpenAPI文档中未定义，后端未实现，已禁用
 * @deprecated 此接口已被禁用，因为后端未实现。如需使用，请先让后端实现此接口并在OpenAPI文档中定义。
 */
// export function updateSampleData(data) {
//   return request({
//     url: '/monitor/sample',
//     method: 'put',
//     data
//   })
// }

/**
 * 删除监测样本数据（支持单个和批量删除）
 * ⚠️ 注意：此接口在OpenAPI文档中未定义，后端未实现，已禁用
 * @deprecated 此接口已被禁用，因为后端未实现。如需使用，请先让后端实现此接口并在OpenAPI文档中定义。
 */
// export function deleteSampleData(ids) {
//   // 处理数组格式的ids
//   const idsStr = Array.isArray(ids) ? ids.join(',') : String(ids)
//   return request({
//     url: `/monitor/sample/${idsStr}`,
//     method: 'delete'
//   })
// }

/**
 * 导出监测样本数据（导出为Excel文件）
 * ⚠️ 注意：此接口在OpenAPI文档中未定义，后端未实现，已禁用
 * @deprecated 此接口已被禁用，因为后端未实现。如需使用，请先让后端实现此接口并在OpenAPI文档中定义。
 */
// export function exportSampleData(params) {
//   return request({
//     url: '/monitor/sample/export',
//     method: 'post',
//     params,
//     responseType: 'blob'
//   })
// }

// ==================== 检测指标管理相关API ====================

/**
 * 获取检测指标列表（分页查询）
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNum=1] - 页码
 * @param {number} [params.pageSize=10] - 每页大小
 * @returns {Promise} 返回分页数据 { code, msg, rows, total }
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
 * @returns {Promise} 返回添加结果 { code, msg, data }
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
 * @param {Object} data - 指标数据（需包含id）
 * @returns {Promise} 返回更新结果 { code, msg, data }
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
 * @param {string|number|Array<string|number>} metricIds - 指标ID或ID数组（支持逗号分隔的字符串）
 * @returns {Promise} 返回删除结果 { code, msg, data }
 */
export function deleteMetric(metricIds) {
  // 处理数组格式的ids，转换为逗号分隔的字符串
  const idsStr = Array.isArray(metricIds) ? metricIds.join(',') : String(metricIds)
  return request({
    url: `/monitor/metric/${idsStr}`,
    method: 'delete'
  })
}
