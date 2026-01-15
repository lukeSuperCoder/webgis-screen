import request from './request'

// 角色信息管理相关API

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 */
export function getRoleList(params) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params
  })
}

/**
 * 获取角色详情
 * @param {string|number} roleId - 角色ID
 */
export function getRoleInfo(roleId) {
  return request({
    url: `/system/role/${roleId}`,
    method: 'get'
  })
}

/**
 * 添加角色
 * @param {Object} data - 角色数据
 */
export function addRole(data) {
  return request({
    url: '/system/role',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 * @param {Object} data - 角色数据
 */
export function updateRole(data) {
  return request({
    url: '/system/role',
    method: 'put',
    data
  })
}

/**
 * 删除角色
 * @param {string|Array} roleIds - 角色ID或ID数组
 */
export function deleteRole(roleIds) {
  return request({
    url: '/system/role',
    method: 'delete',
    data: roleIds
  })
}

/**
 * 导出角色
 * @param {Object} params - 查询参数
 */
export function exportRole(params) {
  return request({
    url: '/system/role/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取角色选项
 * @param {Object} params - 查询参数
 */
export function getRoleOptions(params) {
  return request({
    url: '/system/role/optionselect',
    method: 'get',
    params
  })
}

/**
 * 修改角色状态
 * @param {Object} data - 状态数据
 */
export function changeRoleStatus(data) {
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data
  })
}

/**
 * 修改角色数据权限
 * @param {Object} data - 数据权限数据
 */
export function changeRoleDataScope(data) {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data
  })
}

/**
 * 获取已分配用户角色列表
 * @param {Object} params - 查询参数
 */
export function getRoleAllocatedUserList(params) {
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params
  })
}

/**
 * 获取未分配用户角色列表
 * @param {Object} params - 查询参数
 */
export function getRoleUnallocatedUserList(params) {
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params
  })
}

/**
 * 取消用户授权角色
 * @param {Object} data - 授权数据
 */
export function cancelUserRole(data) {
  return request({
    url: '/system/role/authUser/cancel',
    method: 'put',
    data
  })
}

/**
 * 批量取消用户授权角色
 * @param {Object} data - 授权数据
 */
export function cancelAllUserRole(data) {
  return request({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    data
  })
}

/**
 * 批量选择用户授权
 * @param {Object} data - 授权数据
 */
export function selectAllUserRole(data) {
  return request({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    data
  })
}
