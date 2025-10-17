<template>
  <div class="project-config">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form-inline">
          <el-form-item label="项目编码:">
            <el-input 
              v-model="searchForm.projectCode" 
              placeholder="请输入项目编码"
              style="width: 200px;"
              clearable
            />
          </el-form-item>
          <el-form-item label="项目类型:">
            <el-select v-model="searchForm.projectType" placeholder="请选择项目类型" style="width: 150px;" clearable>
              <el-option label="水质监测" value="水质监测"></el-option>
              <el-option label="环境监测" value="环境监测"></el-option>
              <el-option label="设备维护" value="设备维护"></el-option>
              <el-option label="其他" value="其他"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="企业名称:">
            <el-input 
              v-model="searchForm.companyName" 
              placeholder="请输入企业名称"
              style="width: 200px;"
              clearable
            />
          </el-form-item>
          <el-form-item label="入库时间:">
            <el-date-picker
              v-model="searchForm.storageTime"
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
        <el-button type="primary" @click="addProject">新增</el-button>
        <el-button type="success" @click="handleImport">导入</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="projectsData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="projectCode" label="项目编码" width="200" align="center"></el-table-column>
        <el-table-column prop="projectType" label="项目类型" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.projectType || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="storageTime" label="入库时间" width="200" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.storageTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="负责人" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.manager || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="companyName" label="企业名称" width="200" align="center">
          <template slot-scope="scope">
            {{ scope.row.companyName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="companyCode" label="企业编码" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.companyCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editProject(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewProject(scope.row)">详情</el-button>
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
    
    <!-- 新增/编辑项目对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="projectForm" :rules="rules" ref="projectForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目编码" prop="projectCode">
              <el-input v-model="projectForm.projectCode" placeholder="请输入项目编码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目类型" prop="projectType">
              <el-select v-model="projectForm.projectType" placeholder="请选择项目类型">
                <el-option label="水质监测" value="水质监测"></el-option>
                <el-option label="环境监测" value="环境监测"></el-option>
                <el-option label="设备维护" value="设备维护"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="manager">
              <el-input v-model="projectForm.manager" placeholder="请输入负责人"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业编码" prop="companyCode">
              <el-input v-model="projectForm.companyCode" placeholder="请输入企业编码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="projectForm.companyName" placeholder="请输入企业名称"></el-input>
        </el-form-item>
        
        <el-form-item label="入库时间" prop="storageTime">
          <el-date-picker
            v-model="projectForm.storageTime"
            type="datetime"
            placeholder="请选择入库时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProject">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getProjectList, 
  addProject, 
  updateProject, 
  getProjectInfo,
  getCompanyNames,
  importShpData
} from '@/api/project'

export default {
  name: 'ProjectConfig',
  data() {
    return {
      loading: false,
      searchForm: {
        projectCode: '',
        projectType: '',
        companyName: '',
        storageTime: []
      },
      projectsData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '新增项目',
      projectForm: {
        projectCode: '',
        projectType: '',
        storageTime: '',
        manager: '',
        companyCode: '',
        companyName: ''
      },
      rules: {
        projectCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' }
        ],
        projectType: [
          { required: true, message: '请选择项目类型', trigger: 'change' }
        ],
        manager: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ],
        companyName: [
          { required: true, message: '请输入企业名称', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.loadProjectsData()
  },
  methods: {
    // 加载项目数据
    async loadProjectsData() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }
        // 处理时间范围查询
        if (this.searchForm.storageTime && this.searchForm.storageTime.length === 2) {
          params.startTime = this.searchForm.storageTime[0]
          params.endTime = this.searchForm.storageTime[1]
        }
        delete params.storageTime
        
        const res = await getProjectList(params)
        if (res.code === 0) {
          this.projectsData = res.rows || []
          this.total = res.total || 0
        }
      } catch (error) {
        console.error('获取项目列表失败:', error)
        this.$message.error('获取项目列表失败')
      } finally {
        this.loading = false
      }
    },
    // 查询
    handleQuery() {
      this.currentPage = 1
      this.loadProjectsData()
    },
    // 重置
    handleReset() {
      this.searchForm = {
        projectCode: '',
        projectType: '',
        companyName: '',
        storageTime: []
      }
      this.currentPage = 1
      this.loadProjectsData()
    },
    // 导入
    handleImport() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.shp,.zip'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          try {
            const res = await importShpData(formData)
            if (res.code === 200) {
              this.$message.success('导入成功')
              this.loadProjectsData()
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
      this.loadProjectsData()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadProjectsData()
    },
    // 新增项目
    addProject() {
      this.dialogTitle = '新增项目'
      this.projectForm = {
        projectCode: '',
        projectType: '',
        storageTime: '',
        manager: '',
        companyCode: '',
        companyName: ''
      }
      this.dialogVisible = true
    },
    // 编辑项目
    async editProject(row) {
      this.dialogTitle = '编辑项目'
      try {
        const res = await getProjectInfo(row.id)
        if (res.code === 200) {
          this.projectForm = { ...res.data }
        }
      } catch (error) {
        console.error('获取项目详情失败:', error)
        this.$message.error('获取项目详情失败')
      }
      this.dialogVisible = true
    },
    // 查看项目
    async viewProject(row) {
      try {
        const res = await getProjectInfo(row.id)
        if (res.code === 200) {
          this.$alert(JSON.stringify(res.data, null, 2), '项目详情', {
            confirmButtonText: '确定'
          })
        }
      } catch (error) {
        console.error('获取项目详情失败:', error)
        this.$message.error('获取项目详情失败')
      }
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
    // 保存项目
    saveProject() {
      this.$refs.projectForm.validate(async (valid) => {
        if (valid) {
          try {
            let res
            if (this.projectForm.id) {
              res = await updateProject(this.projectForm)
            } else {
              res = await addProject(this.projectForm)
            }
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.dialogVisible = false
              this.loadProjectsData()
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
.project-config {
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
</style>
