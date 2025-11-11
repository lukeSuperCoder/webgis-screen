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
        <el-button type="primary" @click="addData">新增</el-button>
        <el-button type="success" @click="handleImport" :loading="importLoading">导入</el-button>
        <el-button type="warning" @click="handleExport" :loading="exportLoading">导出</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
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
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
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
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editData(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 录入/编辑数据对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px">
      <el-form :model="dataForm" :rules="rules" ref="dataForm" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="监测井编码" prop="monitoringWellCode">
              <el-select 
                v-model="dataForm.monitoringWellCode" 
                placeholder="请选择监测井编码"
                style="width: 100%"
                filterable
                clearable
              >
                <el-option
                  v-for="item in wellOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采样时间" prop="samplingTime">
              <el-date-picker
                v-model="dataForm.samplingTime"
                type="datetime"
                placeholder="选择采样时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="质量等级" prop="qualityLevel">
              <el-select v-model="dataForm.qualityLevel" placeholder="请选择质量等级" style="width: 100%;">
                <el-option label="I类" value="I类"></el-option>
                <el-option label="II类" value="II类"></el-option>
                <el-option label="III类" value="III类"></el-option>
                <el-option label="IV类" value="IV类"></el-option>
                <el-option label="V类" value="V类"></el-option>
                <el-option label="劣V类" value="劣V类"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">指标数据</el-divider>
        
        <div class="metric-values-section">
          <div class="metric-header">
            <span>指标数据列表</span>
            <el-button type="primary" size="mini" @click="addMetricValue">添加指标</el-button>
          </div>
          
          <el-table :data="dataForm.metricValues" border size="mini" style="margin-top: 10px;">
            <el-table-column prop="metricCode" label="指标编码" width="180">
              <template slot-scope="scope">
                <el-select 
                  v-model="scope.row.metricCode" 
                  placeholder="请选择指标编码"
                  style="width: 100%"
                  filterable
                  @change="handleMetricChange(scope.$index)"
                >
                  <el-option
                    v-for="item in availableMetrics"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="metricName" label="指标名称" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.metricName" placeholder="自动填充" disabled></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="数值" width="120">
              <template slot-scope="scope">
                <el-input-number 
                  v-model="scope.row.value" 
                  placeholder="请输入数值"
                  :precision="3"
                  style="width: 100%"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="100">
              <template slot-scope="scope">
                <el-input v-model="scope.row.unit" placeholder="自动填充" disabled></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="samplingTime" label="采样时间" width="180">
              <template slot-scope="scope">
                <el-date-picker
                  v-model="scope.row.samplingTime"
                  type="datetime"
                  placeholder="选择采样时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  size="mini"
                  style="width: 100%;">
                </el-date-picker>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="removeMetricValue(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData" :loading="saveLoading">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getSampleData, 
  getSampleList,
  addSampleData,
  updateSampleData,
  importSampleData,
  deleteSampleData,
  exportSampleData,
  getSampleMetrics
} from '@/api/monitorData'
import { getMonitorWellCodes } from '@/api/monitorWell'

export default {
  name: 'MonitoringData',
  data() {
    return {
      loading: false,
      saveLoading: false,
      importLoading: false,
      exportLoading: false,
      searchForm: {
        monitoringWellCode: '',
        samplingTime: []
      },
      dataList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedRows: [],
      dialogVisible: false,
      dialogTitle: '录入数据',
      expandedRows: [],
      wellOptions: [], // 监测井选项列表
      availableMetrics: [], // 可用的水质指标选项
      dataForm: {
        id: null,
        monitoringWellCode: '',
        samplingTime: '',
        qualityLevel: '',
        metricValues: []
      },
      rules: {
        monitoringWellCode: [
          { required: true, message: '请选择监测井编码', trigger: 'change' }
        ],
        samplingTime: [
          { required: true, message: '请选择采样时间', trigger: 'change' }
        ],
        qualityLevel: [
          { required: true, message: '请选择质量等级', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.loadDataList()
    this.loadWellOptions()
    this.loadMetricOptions()
  },
  methods: {
    // 加载监测井选项
    async loadWellOptions() {
      try {
        const response = await getMonitorWellCodes()
        if (response.code === 200 || response.code === 0) {
          const wells = response.data || []
          this.wellOptions = wells.map(well => ({
            value: well.wellCode || well,
            label: well.wellCode || well
          }))
        }
      } catch (error) {
        console.error('加载监测井列表失败:', error)
      }
    },
    // 加载指标选项
    async loadMetricOptions() {
      try {
        const response = await getSampleMetrics()
        if (response.code === 200 || response.code === 0) {
          const metrics = response.data || []
          this.availableMetrics = metrics.map(item => ({
            dictValue: item.metricCode || item.code,
            dictLabel: item.metricName || item.name || item.metricCode || item.code,
            unit: item.unit || ''
          }))
        }
      } catch (error) {
        console.error('加载指标列表失败:', error)
      }
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
        
        // 处理时间范围查询，转换为ISO格式
        if (this.searchForm.samplingTime && this.searchForm.samplingTime.length === 2) {
          params.startTime = this.searchForm.samplingTime[0] + 'T00:00:00'
          params.endTime = this.searchForm.samplingTime[1] + 'T23:59:59'
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
    // 导出
    async handleExport() {
      try {
        this.exportLoading = true
        
        // 使用当前筛选条件导出
        const params = {}
        if (this.searchForm.monitoringWellCode) {
          params.monitoringWellCode = this.searchForm.monitoringWellCode
        }
        if (this.searchForm.samplingTime && this.searchForm.samplingTime.length === 2) {
          params.startTime = this.searchForm.samplingTime[0] + 'T00:00:00'
          params.endTime = this.searchForm.samplingTime[1] + 'T23:59:59'
        }
        
        const blob = await exportSampleData(params)
        
        // 处理文件下载
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `监测数据_${new Date().getTime()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请重试')
      } finally {
        this.exportLoading = false
      }
    },
    // 选择改变
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 删除单条数据
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该监测数据吗？', '提示', {
          type: 'warning'
        })
        
        const response = await deleteSampleData(row.id)
        if (response.code === 200 || response.code === 0) {
          this.$message.success('删除成功')
          this.loadDataList()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败，请重试')
        }
      }
    },
    // 批量删除
    async handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的数据')
        return
      }
      
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedRows.length} 条数据吗？`, '提示', {
          type: 'warning'
        })
        
        const ids = this.selectedRows.map(row => row.id).join(',')
        const response = await deleteSampleData(ids)
        
        if (response.code === 200 || response.code === 0) {
          this.$message.success('删除成功')
          this.selectedRows = []
          this.loadDataList()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          this.$message.error('删除失败，请重试')
        }
      }
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
    // 新增数据
    addData() {
      this.dialogTitle = '录入数据'
      this.dataForm = {
        id: null,
        monitoringWellCode: '',
        samplingTime: '',
        qualityLevel: '',
        metricValues: []
      }
      // 确保下拉框数据已加载
      if (this.wellOptions.length === 0) {
        this.loadWellOptions()
      }
      if (this.availableMetrics.length === 0) {
        this.loadMetricOptions()
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate()
      })
    },
    // 编辑数据
    editData(row) {
      this.dialogTitle = '编辑数据'
      this.dataForm = {
        id: row.id,
        monitoringWellCode: row.monitoringWellCode,
        samplingTime: row.samplingTime,
        qualityLevel: row.qualityLevel,
        metricValues: row.metricValues ? JSON.parse(JSON.stringify(row.metricValues)) : []
      }
      // 确保下拉框数据已加载
      if (this.wellOptions.length === 0) {
        this.loadWellOptions()
      }
      if (this.availableMetrics.length === 0) {
        this.loadMetricOptions()
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate()
      })
    },
    // 添加指标
    addMetricValue() {
      this.dataForm.metricValues.push({
        id: null,
        metricCode: '',
        metricName: '',
        value: null,
        unit: '',
        samplingTime: this.dataForm.samplingTime || ''
      })
    },
    // 指标选择变化
    handleMetricChange(index) {
      const metricValue = this.dataForm.metricValues[index]
      const metric = this.availableMetrics.find(m => m.dictValue === metricValue.metricCode)
      
      if (metric) {
        metricValue.metricName = metric.dictLabel
        metricValue.unit = metric.unit || ''
      }
    },
    // 删除指标
    removeMetricValue(index) {
      this.dataForm.metricValues.splice(index, 1)
    },
    // 获取质量等级标签类型
    getQualityLevelType(level) {
      const typeMap = {
        '优': 'success',
        '良': 'primary',
        '中': 'warning',
        '差': 'danger'
      }
      return typeMap[level] || 'info'
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
    // 保存数据
    saveData() {
      this.$refs.dataForm.validate(async (valid) => {
        if (valid) {
          // 验证至少添加一个指标
          if (this.dataForm.metricValues.length === 0) {
            this.$message.warning('请至少添加一个监测指标')
            return
          }
          
          // 验证指标数据完整性
          for (let i = 0; i < this.dataForm.metricValues.length; i++) {
            const metric = this.dataForm.metricValues[i]
            if (!metric.metricCode || metric.value === null || metric.value === '') {
              this.$message.warning(`第${i + 1}个指标数据不完整`)
              return
            }
          }
          
          this.saveLoading = true
          try {
            // 准备提交数据
            const submitData = {
              ...this.dataForm,
              // 确保采样时间格式正确
              samplingTime: this.dataForm.samplingTime,
              // 同步采样时间到所有指标
              metricValues: this.dataForm.metricValues.map(metric => ({
                ...metric,
                samplingTime: this.dataForm.samplingTime
              }))
            }
            
            let res
            if (this.dataForm.id) {
              res = await updateSampleData(submitData)
            } else {
              res = await addSampleData(submitData)
            }
            
            if (res.code === 200 || res.code === 0) {
              this.$message.success(this.dataForm.id ? '编辑成功' : '新增成功')
              this.dialogVisible = false
              this.loadDataList()
            } else {
              this.$message.error(res.msg || '保存失败')
            }
          } catch (error) {
            console.error('保存失败:', error)
            this.$message.error('保存失败，请重试')
          } finally {
            this.saveLoading = false
          }
        } else {
          this.$message.error('请填写完整信息')
        }
      })
    }
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
