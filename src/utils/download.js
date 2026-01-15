/**
 * 下载公共资源文件
 * @param {String} url - 文件相对于public目录的路径
 * @param {String} fileName - 下载后的文件名
 */
export function downloadFile(url, fileName) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || url.split('/').pop()
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 下载监测井信息表模版
 */
export function downloadMonitorWellTemplate() {
  downloadFile('/template/监测井信息表导出模版.xlsx', '监测井信息表模版.xlsx')
}

/**
 * 下载水源地信息表模版
 */
export function downloadWaterSourceTemplate() {
  downloadFile('/template/水源地信息基础表导出模版.xlsx', '水源地信息表模版.xlsx')
}

/**
 * 下载监测数据表模版
 */
export function downloadMonitorDataTemplate() {
  downloadFile('/template/监测数据表导出模版.xlsx', '监测数据表模版.xlsx')
}
