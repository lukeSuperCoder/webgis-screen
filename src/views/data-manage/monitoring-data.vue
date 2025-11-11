<template>
  <div class="monitoring-data">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form-inline">
          <el-form-item label="监测井编码:">
            <el-input 
              v-model="searchForm.monitoringWellCode" 
              placeholder="请输入监测井编码"
              style="width: 200px;"
              clearable
            />
          </el-form-item>
          <el-form-item label="采样时间:">
            <el-date-picker
              v-model="searchForm.samplingTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;"
              value-format="yyyy-MM-dd">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="success" @click="handleImport" :loading="importLoading">导入</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="dataList" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
        :expand-row-keys="expandedRows"
        :row-key="getRowKey"
      >
        <el-table-column type="expand" width="50" align="center">
          <template slot-scope="scope">
            <div class="metric-details">
              <h4>指标详情</h4>
              <el-table :data="scope.row.metricValues" size="mini" border>
                <el-table-column prop="metricCode" label="指标编码" width="120" align="center"></el-table-column>
                <el-table-column prop="metricName" label="指标名称" width="150" align="center"></el-table-column>
                <el-table-column prop="value" label="数值" width="100" align="center"></el-table-column>
                <el-table-column prop="unit" label="单位" width="80" align="center"></el-table-column>
                <el-table-column prop="samplingTime" label="采样时间" width="180" align="center">
                  <template slot-scope="scope">
                    {{ formatDateTime(scope.row.samplingTime) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="monitoringWellCode" label="监测井编码" align="center"></el-table-column>
        <el-table-column prop="samplingTime" label="采样时间" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.samplingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="qualityLevel" label="质量等级" width="120" align="center">
          <template slot-scope="scope">
              {{ scope.row.qualityLevel }}
          </template>
        </el-table-column>
        <el-table-column label="指标数量" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.metricValues ? scope.row.metricValues.length : 0 }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total"
        style="margin-top: 20px; text-align: right;">
      </el-pagination>
    </el-card>
    
  </div>
</template>

<script>
import { 
  getSampleList,
  importSampleData
} from '@/api/monitorData'

export default {
  name: 'MonitoringData',
  data() {
    return {
      loading: false,
      importLoading: false,
      searchForm: {
        monitoringWellCode: '',
        samplingTime: []
      },
      dataList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      expandedRows: []
    }
  },
  mounted() {
    this.loadDataList()
  },
  methods: {
    // 为表格行生成稳定唯一的 key，避免 undefined 导致的重复 key 警告
    getRowKey(row) {
      // 优先使用后端返回的 id
      if (row && row.id != null) {
        return row.id
      }
      // 退化为由业务字段组合的 key（需保证组合后在当前页唯一）
      const well = row && row.monitoringWellCode ? row.monitoringWellCode : 'well'
      const time = row && row.samplingTime ? row.samplingTime : 'time'
      return `${well}__${time}`
    },
    // 加载数据列表
    async loadDataList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        
        // 只添加后端支持的查询参数
        if (this.searchForm.monitoringWellCode) {
          params.monitoringWellCode = this.searchForm.monitoringWellCode
        }
        
        // 处理时间范围查询，转换为 yyyy-MM-dd HH:mm:ss 格式
        if (this.searchForm.samplingTime && this.searchForm.samplingTime.length === 2) {
          params.startTime = this.searchForm.samplingTime[0] + ' 00:00:00'
          params.endTime = this.searchForm.samplingTime[1] + ' 23:59:59'
        }
        
        const res = await getSampleList(params)
        if (res.code === 200 || res.code === 0) {
          this.dataList = res.rows || []
          this.total = res.total || 0
        } else {
          this.$message.error(res.msg || '获取监测数据列表失败')
        }
      } catch (error) {
        console.error('获取监测数据列表失败:', error)
        this.$message.error('获取监测数据列表失败')
      } finally {
        this.loading = false
      }
    },
    // 查询
    handleQuery() {
      this.currentPage = 1
      this.loadDataList()
    },
    // 重置
    handleReset() {
      this.searchForm = {
        monitoringWellCode: '',
        samplingTime: []
      }
      this.currentPage = 1
      this.loadDataList()
    },
    // 导入
    handleImport() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx,.xls'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          this.importLoading = true
          const formData = new FormData()
          formData.append('file', file)
          try {
            const res = await importSampleData(formData)
            if (res.code === 200 || res.code === 0) {
              this.$message.success('导入成功')
              this.loadDataList()
            } else {
              this.$message.error(res.msg || '导入失败')
            }
          } catch (error) {
            console.error('导入失败:', error)
            this.$message.error('导入失败，请重试')
          } finally {
            this.importLoading = false
          }
        }
      }
      input.click()
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadDataList()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadDataList()
    },
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      try {
        const date = new Date(dateTime)
        if (isNaN(date.getTime())) return dateTime
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('日期格式化错误:', error)
        return dateTime
      }
    },
  }
}
</script>

<style scoped>
.monitoring-data {
  height: 100%;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 15px;
}

.search-form-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.search-form-inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.table-card {
  flex: 1;
}

.dialog-footer {
  text-align: right;
}

.metric-details {
  padding: 20px;
  background-color: #f8f9fa;
}

.metric-details h4 {
  margin-bottom: 15px;
  color: #409EFF;
}

.metric-values-section {
  margin-top: 20px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-header span {
  font-weight: 500;
  color: #606266;
}
</style>
