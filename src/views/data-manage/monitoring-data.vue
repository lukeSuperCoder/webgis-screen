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
          <el-form-item label="指标名称:">
            <el-input 
              v-model="searchForm.metricName" 
              placeholder="请输入指标名称"
              style="width: 200px;"
              clearable
            />
          </el-form-item>
          <el-form-item label="质量等级:">
            <el-select v-model="searchForm.qualityLevel" placeholder="请选择质量等级" style="width: 150px;" clearable>
              <el-option label="优" value="优"></el-option>
              <el-option label="良" value="良"></el-option>
              <el-option label="中" value="中"></el-option>
              <el-option label="差" value="差"></el-option>
            </el-select>
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
        <el-button type="success" @click="handleImport">导入</el-button>
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
        row-key="monitoringWellCode"
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
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editData(scope.row)">编辑</el-button>
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
              <el-input v-model="dataForm.monitoringWellCode" placeholder="请输入监测井编码"></el-input>
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
                <el-option label="优" value="优"></el-option>
                <el-option label="良" value="良"></el-option>
                <el-option label="中" value="中"></el-option>
                <el-option label="差" value="差"></el-option>
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
            <el-table-column prop="metricCode" label="指标编码" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.metricCode" placeholder="请输入指标编码"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="metricName" label="指标名称" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.metricName" placeholder="请输入指标名称"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="数值" width="120">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" placeholder="请输入数值"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="100">
              <template slot-scope="scope">
                <el-input v-model="scope.row.unit" placeholder="请输入单位"></el-input>
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
        <el-button type="primary" @click="saveData">保存</el-button>
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
  importSampleData
} from '@/api/monitorData'

export default {
  name: 'MonitoringData',
  data() {
    return {
      loading: false,
      searchForm: {
        monitoringWellCode: '',
        samplingTime: [],
        metricName: '',
        qualityLevel: ''
      },
      dataList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '录入数据',
      expandedRows: [],
      dataForm: {
        monitoringWellCode: '',
        samplingTime: '',
        qualityLevel: '',
        metricValues: []
      },
      rules: {
        monitoringWellCode: [
          { required: true, message: '请输入监测井编码', trigger: 'blur' }
        ],
        samplingTime: [
          { required: true, message: '请选择采样时间', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.loadDataList()
  },
  methods: {
    // 加载数据列表
    async loadDataList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }
        // 处理时间范围查询
        if (this.searchForm.samplingTime && this.searchForm.samplingTime.length === 2) {
          params.startTime = this.searchForm.samplingTime[0]
          params.endTime = this.searchForm.samplingTime[1]
        }
        delete params.samplingTime
        
        const res = await getSampleList(params)
        if (res.code === 200) {
          this.dataList = res.rows || []
          this.total = res.total || 0
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
        samplingTime: [],
        metricName: '',
        qualityLevel: ''
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
          const formData = new FormData()
          formData.append('file', file)
          try {
            const res = await importSampleData(formData)
            if (res.code === 200) {
              this.$message.success('导入成功')
              this.loadDataList()
            }
          } catch (error) {
            console.error('导入失败:', error)
            this.$message.error('导入失败')
          }
        }
      }
      input.click()
    },
    // 导出
    handleExport() {
      this.$message.info('导出功能开发中')
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
        monitoringWellCode: '',
        samplingTime: '',
        qualityLevel: '',
        metricValues: []
      }
      this.dialogVisible = true
    },
    // 编辑数据
    editData(row) {
      this.dialogTitle = '编辑数据'
      this.dataForm = {
        monitoringWellCode: row.monitoringWellCode,
        samplingTime: row.samplingTime,
        qualityLevel: row.qualityLevel,
        metricValues: row.metricValues ? [...row.metricValues] : []
      }
      this.dialogVisible = true
    },
    // 添加指标
    addMetricValue() {
      this.dataForm.metricValues.push({
        metricCode: '',
        metricName: '',
        value: '',
        unit: '',
        samplingTime: ''
      })
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
          try {
            let res
            if (this.dataForm.id) {
              res = await updateSampleData(this.dataForm)
            } else {
              res = await addSampleData(this.dataForm)
            }
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.dialogVisible = false
              this.loadDataList()
            }
          } catch (error) {
            console.error('保存失败:', error)
            this.$message.error('保存失败')
          }
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
