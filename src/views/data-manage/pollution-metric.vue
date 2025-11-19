<template>
  <div class="pollution-metric">
    <div class="search-section">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="指标名称:">
          <el-input
            v-model="searchForm.metricName"
            placeholder="请输入指标名称"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="指标编码:">
          <el-input
            v-model="searchForm.metricCode"
            placeholder="请输入指标编码"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="openAddDialog">新增</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          :disabled="!selectedRows.length"
          @click="handleDelete()"
        >
          批量删除
        </el-button>
        <el-button
          type="success"
          icon="el-icon-upload2"
          :loading="importLoading"
          @click="handleImport"
        >
          导入
        </el-button>
        <el-button icon="el-icon-download" @click="handleExport">导出</el-button>
        <input
          ref="importInput"
          type="file"
          class="hidden-file-input"
          accept=".xls,.xlsx"
          @change="onFileChange"
        />
      </div>
    </div>

    <el-card class="table-card">
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="metricName" label="指标名称" min-width="160" />
        <el-table-column prop="metricCode" label="指标编码" min-width="140" />
        <el-table-column prop="unit" label="单位" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.unit || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="metricForm" label-width="100px">
        <el-form-item label="指标名称" prop="metricName">
          <el-input v-model="form.metricName" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="指标编码" prop="metricCode">
          <el-input v-model="form.metricCode" placeholder="请输入指标编码" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-input v-model="form.category" placeholder="请输入类别" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listPollutionMetrics,
  addPollutionMetric,
  updatePollutionMetric,
  deletePollutionMetrics,
  getPollutionMetric,
  importPollutionMetrics,
  exportPollutionMetrics
} from '@/api/pollutionMetric'

export default {
  name: 'PollutionMetricManage',
  data() {
    return {
      loading: false,
      importLoading: false,
      searchForm: {
        metricName: '',
        metricCode: ''
      },
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增指标',
      form: {
        id: undefined,
        metricName: '',
        metricCode: '',
        category: '',
        unit: ''
      },
      rules: {
        metricName: [{ required: true, message: '请输入指标名称', trigger: 'blur' }],
        metricCode: [{ required: true, message: '请输入指标编码', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }
        const res = await listPollutionMetrics(params)
        this.tableData = res.rows || []
        this.pagination.total = res.total || 0
      } catch (error) {
        console.error('获取污染物指标失败:', error)
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.pagination.currentPage = 1
      this.fetchList()
    },
    handleReset() {
      this.searchForm = {
        metricName: '',
        metricCode: ''
      }
      this.pagination.currentPage = 1
      this.fetchList()
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
      this.fetchList()
    },
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchList()
    },
    openAddDialog() {
      this.dialogTitle = '新增指标'
      this.form = {
        id: undefined,
        metricName: '',
        metricCode: '',
        category: '',
        unit: ''
      }
      this.dialogVisible = true
    },
    async openEditDialog(row) {
      this.dialogTitle = '编辑指标'
      try {
        const res = await getPollutionMetric(row.id)
        if (res && res.data) {
          this.form = { ...res.data }
        } else {
          this.form = { ...row }
        }
        this.dialogVisible = true
      } catch (error) {
        console.error('获取指标详情失败:', error)
        this.$message.error('获取指标详情失败')
      }
    },
    resetForm() {
      if (this.$refs.metricForm) {
        this.$refs.metricForm.resetFields()
      }
    },
    submitForm() {
      this.$refs.metricForm.validate(async (valid) => {
        if (!valid) return
        try {
          const submitData = { ...this.form }
          let res
          if (submitData.id) {
            res = await updatePollutionMetric(submitData)
          } else {
            res = await addPollutionMetric(submitData)
          }
          if (res.code === 200 || res.code === 0) {
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.fetchList()
          }
        } catch (error) {
          console.error('保存指标失败:', error)
        }
      })
    },
    async handleDelete(row) {
      const ids = row ? [row.id] : this.selectedRows.map((item) => item.id)
      if (!ids.length) {
        this.$message.warning('请选择需要删除的记录')
        return
      }
      try {
        await this.$confirm('确定要删除选中的指标吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deletePollutionMetrics(ids.join(','))
        this.$message.success('删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
        }
      }
    },
    handleImport() {
      if (this.importLoading) return
      this.$refs.importInput && this.$refs.importInput.click()
    },
    async onFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      const allowedExtensions = ['xls', 'xlsx']
      const ext = file.name.split('.').pop().toLowerCase()
      if (!allowedExtensions.includes(ext)) {
        this.$message.warning('请选择 Excel 文件（.xls/.xlsx）')
        event.target.value = ''
        return
      }
      this.importLoading = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        await importPollutionMetrics(formData)
        this.$message.success('导入成功')
        this.fetchList()
      } catch (error) {
        console.error('导入失败:', error)
        this.$message.error('导入失败，请稍后重试')
      } finally {
        this.importLoading = false
        event.target.value = ''
      }
    },
    async handleExport() {
      try {
        const blob = await exportPollutionMetrics({ ...this.searchForm })
        if (!blob) {
          this.$message.error('导出失败')
          return
        }
        if (blob.type && blob.type.includes('application/json')) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const result = JSON.parse(reader.result)
              this.$message.error(result.msg || '导出失败')
            } catch (e) {
              this.$message.error('导出失败')
            }
          }
          reader.readAsText(blob)
          return
        }
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')
        this.saveBlob(blob, `污染物指标_${timestamp}.xlsx`)
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      }
    },
    saveBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }
}
</script>

<style scoped>
.pollution-metric {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.table-card {
  flex: 1;
}

.hidden-file-input {
  display: none;
}
</style>

