import request from './request'

// 部门管理相关API

/**
 * 获取部门列表
 * @param {Object} params - 查询参数
 */
export function getDeptList(params) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params
  })
}

/**
 * 获取部门详情
 * @param {string|number} deptId - 部门ID
 */
export function getDeptInfo(deptId) {
  return request({
    url: `/system/dept/${deptId}`,
    method: 'get'
  })
}

/**
 * 添加部门
 * @param {Object} data - 部门数据
 */
export function addDept(data) {
  return request({
    url: '/system/dept',
    method: 'post',
    data
  })
}

/**
 * 更新部门
 * @param {Object} data - 部门数据
 */
export function updateDept(data) {
  return request({
    url: '/system/dept',
    method: 'put',
    data
  })
}

/**
 * 删除部门
 * @param {string|number} deptId - 部门ID
 */
export function deleteDept(deptId) {
  return request({
    url: `/system/dept/${deptId}`,
    method: 'delete'
  })
}
