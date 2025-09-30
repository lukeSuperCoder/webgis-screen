<template>
  <div class="monitoring-data">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>监测数据:</label>
        <el-select 
          v-model="searchForm.dataType" 
          placeholder="全部"
          style="width: 200px; margin-right: 10px;"
          clearable
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="pH值" value="ph"></el-option>
          <el-option label="溶解氧" value="do"></el-option>
          <el-option label="氨氮" value="nh3n"></el-option>
          <el-option label="总磷" value="tp"></el-option>
          <el-option label="总氮" value="tn"></el-option>
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button>
          展开
          <i class="el-icon-arrow-down"></i>
        </el-button>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="addData">新增</el-button>
        <el-button type="primary" @click="handleBatchImport">批量导入</el-button>
        <el-button type="primary" @click="handleBatchExport">批量导出</el-button>
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
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="wellName" label="监测井" width="150" align="center"></el-table-column>
        <el-table-column prop="project" label="监测项目" width="120" align="center"></el-table-column>
        <el-table-column prop="value" label="数值" width="100" align="center"></el-table-column>
        <el-table-column prop="unit" label="单位" width="80" align="center"></el-table-column>
        <el-table-column prop="measureTime" label="监测时间" width="150" align="center"></el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editData(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewData(scope.row)">详情</el-button>
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
    
    <!-- 录入/编辑数据对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="dataForm" :rules="rules" ref="dataForm" label-width="120px">
        <el-form-item label="监测井" prop="wellId">
          <el-select v-model="dataForm.wellId" placeholder="请选择监测井">
            <el-option
              v-for="well in wells"
              :key="well.id"
              :label="well.name"
              :value="well.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="监测项目" prop="project">
          <el-select v-model="dataForm.project" placeholder="请选择监测项目">
            <el-option label="pH值" value="ph"></el-option>
            <el-option label="溶解氧" value="do"></el-option>
            <el-option label="氨氮" value="nh3n"></el-option>
            <el-option label="总磷" value="tp"></el-option>
            <el-option label="总氮" value="tn"></el-option>
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数值" prop="value">
              <el-input v-model="dataForm.value" placeholder="请输入数值"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="dataForm.unit" placeholder="请输入单位"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="监测时间" prop="measureTime">
          <el-date-picker
            v-model="dataForm.measureTime"
            type="datetime"
            placeholder="选择监测时间">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="操作员" prop="operator">
          <el-input v-model="dataForm.operator" placeholder="请输入操作员"></el-input>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="dataForm.remark" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MonitoringData',
  data() {
    return {
      loading: false,
      searchForm: {
        dataType: ''
      },
      wells: [
        { id: 1, name: '呼和浩特监测井001' },
        { id: 2, name: '呼和浩特监测井002' },
        { id: 3, name: '呼和浩特监测井003' }
      ],
      dataList: [
        {
          id: 1,
          wellId: 1,
          wellName: '呼和浩特监测井001',
          project: 'pH值',
          value: '7.2',
          unit: '',
          measureTime: '2024-01-15 10:30:00',
          operator: '张三',
          status: '正常',
          remark: '数据正常'
        },
        {
          id: 2,
          wellId: 1,
          wellName: '呼和浩特监测井001',
          project: '溶解氧',
          value: '8.5',
          unit: 'mg/L',
          measureTime: '2024-01-15 10:30:00',
          operator: '张三',
          status: '正常',
          remark: '数据正常'
        },
        {
          id: 3,
          wellId: 2,
          wellName: '呼和浩特监测井002',
          project: '氨氮',
          value: '0.8',
          unit: 'mg/L',
          measureTime: '2024-01-15 11:00:00',
          operator: '李四',
          status: '正常',
          remark: '数据正常'
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 3,
      dialogVisible: false,
      dialogTitle: '录入数据',
      dataForm: {
        wellId: '',
        project: '',
        value: '',
        unit: '',
        measureTime: '',
        operator: '',
        remark: ''
      },
      rules: {
        wellId: [
          { required: true, message: '请选择监测井', trigger: 'change' }
        ],
        project: [
          { required: true, message: '请选择监测项目', trigger: 'change' }
        ],
        value: [
          { required: true, message: '请输入数值', trigger: 'blur' }
        ],
        measureTime: [
          { required: true, message: '请选择监测时间', trigger: 'change' }
        ],
        operator: [
          { required: true, message: '请输入操作员', trigger: 'blur' }
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
      this.searchForm.dataType = ''
      this.$message.info('重置成功')
    },
    // 批量导入
    handleBatchImport() {
      this.$message.success('批量导入功能')
    },
    // 批量导出
    handleBatchExport() {
      this.$message.success('批量导出功能')
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
    // 新增数据
    addData() {
      this.dialogTitle = '录入数据'
      this.dataForm = {
        wellId: '',
        project: '',
        value: '',
        unit: '',
        measureTime: '',
        operator: '',
        remark: ''
      }
      this.dialogVisible = true
    },
    // 编辑数据
    editData(row) {
      this.dialogTitle = '编辑数据'
      this.dataForm = { ...row }
      this.dialogVisible = true
    },
    // 查看数据
    viewData(row) {
      this.$message.info(`查看数据: ${row.wellName} - ${row.project}`)
    },
    // 保存数据
    saveData() {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$message.success('数据保存成功')
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
