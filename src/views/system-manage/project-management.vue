<template>
  <div class="project-management">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>站点名称:</label>
        <el-input 
          v-model="searchForm.siteName" 
          placeholder="请选择站点名称"
          style="width: 200px; margin-right: 10px;"
          clearable
        >
          <i slot="suffix" class="el-input__icon el-icon-arrow-down"></i>
        </el-input>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button>
          展开
          <i class="el-icon-arrow-down"></i>
        </el-button>
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
        <el-table-column prop="projectName" label="项目名称" width="120" align="center"></el-table-column>
        <el-table-column prop="projectIdentifier" label="项目标识" width="120" align="center"></el-table-column>
        <el-table-column prop="projectUnit" label="项目单位" width="100" align="center"></el-table-column>
        <el-table-column prop="monitoringType" label="监测类型" width="120" align="center"></el-table-column>
        <el-table-column prop="decimalPlaces" label="小数点位" width="100" align="center"></el-table-column>
        <el-table-column prop="isEnabled" label="是否启用" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isEnabled === '启用' ? 'success' : 'danger'">
              {{ scope.row.isEnabled }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" align="center"></el-table-column>
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
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="projectForm.projectName" placeholder="请输入项目名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目标识" prop="projectIdentifier">
              <el-input v-model="projectForm.projectIdentifier" placeholder="请输入项目标识"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目单位" prop="projectUnit">
              <el-input v-model="projectForm.projectUnit" placeholder="请输入项目单位"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="监测类型" prop="monitoringType">
              <el-select v-model="projectForm.monitoringType" placeholder="请选择监测类型">
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
            <el-form-item label="小数点位" prop="decimalPlaces">
              <el-input v-model="projectForm.decimalPlaces" placeholder="请输入小数点位"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="isEnabled">
              <el-radio-group v-model="projectForm.isEnabled">
                <el-radio label="启用">启用</el-radio>
                <el-radio label="故障">故障</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
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
  name: 'ProjectManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        siteName: ''
      },
      projectsData: [
        {
          id: 1,
          projectName: '水温',
          projectIdentifier: 'watertemp',
          projectUnit: '°C',
          monitoringType: '水质设备',
          decimalPlaces: '1',
          isEnabled: '启用',
          createTime: '2023-09-11 04:53',
          description: '水温监测项目'
        },
        {
          id: 2,
          projectName: 'pH',
          projectIdentifier: 'ph',
          projectUnit: '',
          monitoringType: '水质设备',
          decimalPlaces: '1',
          isEnabled: '故障',
          createTime: '2022-02-16 02:44',
          description: 'pH值监测项目'
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 3,
      dialogVisible: false,
      dialogTitle: '新增项目',
      projectForm: {
        projectName: '',
        projectIdentifier: '',
        projectUnit: '',
        monitoringType: '',
        decimalPlaces: '',
        isEnabled: '启用',
        description: ''
      },
      rules: {
        projectName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        projectIdentifier: [
          { required: true, message: '请输入项目标识', trigger: 'blur' }
        ],
        projectUnit: [
          { required: false, message: '请输入项目单位', trigger: 'blur' }
        ],
        monitoringType: [
          { required: true, message: '请选择监测类型', trigger: 'change' }
        ],
        decimalPlaces: [
          { required: true, message: '请输入小数点位', trigger: 'blur' }
        ],
        isEnabled: [
          { required: true, message: '请选择是否启用', trigger: 'change' }
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
      this.searchForm.siteName = ''
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
        projectName: '',
        projectIdentifier: '',
        projectUnit: '',
        monitoringType: '',
        decimalPlaces: '',
        isEnabled: '启用',
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
      this.$message.info(`查看项目: ${row.projectName}`)
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
.project-management {
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
