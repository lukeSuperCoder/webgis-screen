import request from './request'

// 用户管理API

/**
 * 获取用户列表
 * @param {Object} params 查询参数
 * @param {string} params.userName 用户名
 * @param {string} params.nickName 昵称
 * @param {string} params.email 邮箱
 * @param {string} params.phonenumber 手机号
 * @param {string} params.status 状态
 * @param {number} params.deptId 部门ID
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页记录数
 */
export function getUserList(params) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

/**
 * 新增用户
 * @param {Object} data 用户数据
 * @param {string} data.userName 用户名
 * @param {string} data.nickName 昵称
 * @param {string} data.email 邮箱
 * @param {string} data.phonenumber 手机号
 * @param {string} data.password 密码
 * @param {string} data.sex 性别
 * @param {string} data.status 状态
 * @param {number} data.deptId 部门ID
 * @param {string} data.remark 备注
 */
export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

/**
 * 修改用户
 * @param {Object} data 用户数据
 * @param {number} data.userId 用户ID
 * @param {string} data.userName 用户名
 * @param {string} data.nickName 昵称
 * @param {string} data.email 邮箱
 * @param {string} data.phonenumber 手机号
 * @param {string} data.sex 性别
 * @param {string} data.status 状态
 * @param {number} data.deptId 部门ID
 * @param {string} data.remark 备注
 */
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {string} userIds 要删除的用户ID，多个用逗号分隔
 */
export function deleteUser(userIds) {
  return request({
    url: `/system/user/${userIds}`,
    method: 'delete'
  })
}

/**
 * 根据用户ID获取详细信息
 * @param {number} userId 用户ID
 */
export function getUserInfo(userId) {
  return request({
    url: `/system/user/${userId}`,
    method: 'get'
  })
}

/**
 * 修改用户状态
 * @param {Object} data 用户数据
 * @param {number} data.userId 用户ID
 * @param {string} data.status 状态
 */
export function changeUserStatus(data) {
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data
  })
}

/**
 * 重置用户密码
 * @param {Object} data 用户数据
 * @param {number} data.userId 用户ID
 * @param {string} data.password 新密码
 */
export function resetUserPassword(data) {
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data
  })
}


/**
 * 获取部门树列表
 * @param {Object} params 查询参数
 */
export function getDeptTree(params) {
  return request({
    url: '/system/user/deptTree',
    method: 'get',
    params
  })
}

/**
 * 导出用户列表
 * @param {Object} params 查询参数
 */
export function exportUser(params) {
  return request({
    url: '/system/user/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

/**
 * 导入用户数据
 * @param {FormData} formData 包含文件的表单数据
 */
export function importUser(formData) {
  return request({
    url: '/system/user/importData',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载导入用户数据模板
 */
export function downloadTemplate() {
  return request({
    url: '/system/user/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}