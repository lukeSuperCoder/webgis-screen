import request from './request'

// 系统访问记录和操作日志管理相关API

/**
 * 获取登录日志列表
 * @param {Object} params - 查询参数
 */
export function getLoginLogList(params) {
  return request({
    url: '/monitor/logininfor/list',
    method: 'get',
    params
  })
}

/**
 * 导出登录日志
 * @param {Object} params - 查询参数
 */
export function exportLoginLog(params) {
  return request({
    url: '/monitor/logininfor/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 清空登录日志
 */
export function cleanLoginLog() {
  return request({
    url: '/monitor/logininfor/clean',
    method: 'delete'
  })
}

/**
 * 获取操作日志列表
 * @param {Object} params - 查询参数
 */
export function getOperLogList(params) {
  return request({
    url: '/monitor/operlog/list',
    method: 'get',
    params
  })
}

/**
 * 导出操作日志
 * @param {Object} params - 查询参数
 */
export function exportOperLog(params) {
  return request({
    url: '/monitor/operlog/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 清空操作日志
 */
export function cleanOperLog() {
  return request({
    url: '/monitor/operlog/clean',
    method: 'delete'
  })
}
