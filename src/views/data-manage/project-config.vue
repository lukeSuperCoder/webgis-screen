<template>
  <div class="project-config">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>企业名称:</label>
        <el-select 
          v-model="searchForm.enterpriseName" 
          placeholder="全部"
          style="width: 200px; margin-right: 10px;"
          clearable
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="水质设备企业" value="水质设备"></el-option>
          <el-option label="环保设备企业" value="环保设备"></el-option>
          <el-option label="监测设备企业" value="监测设备"></el-option>
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="addProject">新增</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
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
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="enterpriseNumber" label="企业编号" width="120" align="center"></el-table-column>
        <el-table-column prop="enterpriseType" label="企业类型" width="120" align="center"></el-table-column>
        <el-table-column prop="monitoringWellsCount" label="监测井数量" width="120" align="center"></el-table-column>
        <el-table-column prop="storageTime" label="入库时间" width="150" align="center"></el-table-column>
        <el-table-column prop="personInCharge" label="负责人" width="100" align="center"></el-table-column>
        <el-table-column prop="projectBoundary" label="项目边界" width="120" align="center"></el-table-column>
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
        :page-sizes="[20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total"
        style="margin-top: 20px; text-align: right;">
      </el-pagination>
    </el-card>
    
    <!-- 新增/编辑项目对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="projectForm" :rules="rules" ref="projectForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业编号" prop="enterpriseNumber">
              <el-input v-model="projectForm.enterpriseNumber" placeholder="请输入企业编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业类型" prop="enterpriseType">
              <el-select v-model="projectForm.enterpriseType" placeholder="请选择企业类型">
                <el-option label="水质设备" value="水质设备"></el-option>
                <el-option label="环保设备" value="环保设备"></el-option>
                <el-option label="监测设备" value="监测设备"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="监测井数量" prop="monitoringWellsCount">
              <el-input-number v-model="projectForm.monitoringWellsCount" :min="0" :max="100" placeholder="监测井数量"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="personInCharge">
              <el-input v-model="projectForm.personInCharge" placeholder="请输入负责人"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="入库时间" prop="storageTime">
          <el-date-picker
            v-model="projectForm.storageTime"
            type="datetime"
            placeholder="请选择入库时间"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="项目边界" prop="projectBoundary">
          <el-select v-model="projectForm.projectBoundary" placeholder="请选择项目边界">
            <el-option label="导入" value="导入"></el-option>
            <el-option label="手动录入" value="手动录入"></el-option>
            <el-option label="系统生成" value="系统生成"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="项目描述" prop="description">
          <el-input type="textarea" v-model="projectForm.description" placeholder="请输入项目描述"></el-input>
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
export default {
  name: 'ProjectConfig',
  data() {
    return {
      loading: false,
      searchForm: {
        enterpriseName: ''
      },
      projectsData: [
        {
          id: 1,
          enterpriseNumber: '1200001',
          enterpriseType: '水质设备',
          monitoringWellsCount: 6,
          storageTime: '2023-05-22 15:16',
          personInCharge: 'XXX',
          projectBoundary: '导入',
          description: '水质设备企业项目'
        },
        {
          id: 2,
          enterpriseNumber: '1200002',
          enterpriseType: '水质设备',
          monitoringWellsCount: 4,
          storageTime: '2023-05-22 15:16',
          personInCharge: 'XXX',
          projectBoundary: '导入',
          description: '水质设备企业项目'
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 3,
      dialogVisible: false,
      dialogTitle: '新增项目',
      projectForm: {
        enterpriseNumber: '',
        enterpriseType: '',
        monitoringWellsCount: 0,
        storageTime: '',
        personInCharge: '',
        projectBoundary: '',
        description: ''
      },
      rules: {
        enterpriseNumber: [
          { required: true, message: '请输入企业编号', trigger: 'blur' }
        ],
        enterpriseType: [
          { required: true, message: '请选择企业类型', trigger: 'change' }
        ],
        monitoringWellsCount: [
          { required: true, message: '请输入监测井数量', trigger: 'blur' }
        ],
        storageTime: [
          { required: true, message: '请选择入库时间', trigger: 'change' }
        ],
        personInCharge: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ],
        projectBoundary: [
          { required: true, message: '请选择项目边界', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    // 查询
    handleQuery() {
      this.loading = true
      // 模拟查询
      setTimeout(() => {
        this.loading = false
        this.$message.success('查询完成')
      }, 1000)
    },
    // 重置
    handleReset() {
      this.searchForm.enterpriseName = ''
      this.$message.info('重置成功')
    },
    // 导出
    handleExport() {
      this.$message.success('导出功能')
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
    },
    // 新增项目
    addProject() {
      this.dialogTitle = '新增项目'
      this.projectForm = {
        enterpriseNumber: '',
        enterpriseType: '',
        monitoringWellsCount: 0,
        storageTime: '',
        personInCharge: '',
        projectBoundary: '',
        description: ''
      }
      this.dialogVisible = true
    },
    // 编辑项目
    editProject(row) {
      this.dialogTitle = '编辑项目'
      this.projectForm = { ...row }
      this.dialogVisible = true
    },
    // 查看项目
    viewProject(row) {
      this.$message.info(`查看项目: ${row.enterpriseNumber}`)
    },
    // 保存项目
    saveProject() {
      this.$refs.projectForm.validate((valid) => {
        if (valid) {
          this.$message.success('项目配置保存成功')
          this.dialogVisible = false
        } else {
          this.$message.error('请填写完整信息')
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
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.search-form label {
  margin-right: 10px;
  font-weight: 500;
  color: #606266;
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
