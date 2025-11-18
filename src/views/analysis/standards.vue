<template>
  <div class="standards-view">
    <!-- 查询条件 -->
    <el-card class="filter-card">
      <el-form :model="queryForm" :inline="true" label-width="100px" class="filter-form">
        <el-form-item label="标准名称:">
          <el-input
            v-model="queryForm.standardName"
            placeholder="请输入标准名称"
            clearable
            style="width: 260px;"
          />
        </el-form-item>
        <el-form-item label="创建时间:">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            unlink-panels
            value-format="yyyy-MM-dd"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标准文件列表 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" icon="el-icon-upload2" @click="openImportDialog">
            导入文件
          </el-button>
          <el-button icon="el-icon-refresh" :loading="loading" @click="loadStandardList">
            刷新
          </el-button>
        </div>
        <div class="toolbar-right">
          <span class="result-count">共 {{ total }} 条标准文件</span>
        </div>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        :loading="loading"
        :row-key="getRowKey"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          prop="standardName"
          label="标准名称"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          prop="planName"
          label="评价方案名称"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          prop="standardNature"
          label="标准性质"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.standardNature || '--' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="类型"
          width="140"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatType(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="executionDate"
          label="执行日期"
          width="160"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.executionDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="上传时间"
          width="180"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="filePath"
          label="文件名"
          min-width="200"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ getFileName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-download"
              :loading="downloadLoadingId === scope.row.id"
              @click="handleDownload(scope.row)"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="table-pagination"
        layout="total, sizes, prev, pager, next"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 导入弹窗 -->
    <el-dialog
      title="导入评价标准文件"
      :visible.sync="importDialogVisible"
      width="520px"
      @close="resetImportForm"
    >
      <el-form
        ref="importFormRef"
        :model="importForm"
        :rules="importRules"
        label-width="120px"
      >
        <el-form-item label="标准文件" prop="file">
          <div class="file-picker">
            <el-input
              v-model="importForm.fileName"
              placeholder="请选择要导入的文件"
              readonly
            />
            <el-button @click="triggerFileSelect">选择文件</el-button>
            <input
              ref="fileInputRef"
              type="file"
              class="hidden-file-input"
              accept=".xls,.xlsx,.doc,.docx,.pdf"
              @change="handleFileChange"
            />
          </div>
          <p class="upload-tip">
            支持 .xls、.xlsx、.doc、.docx、.pdf，单个文件不超过 10 MB。
          </p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="submitImport">
          开始导入
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  downloadEvaluationStandard,
  getEvaluationViewList,
  importEvaluationStandard
} from '@/api/evaluation'

export default {
  name: 'StandardsView',
  data() {
    return {
      loading: false,
      importLoading: false,
      downloadLoadingId: null,
      queryForm: {
        standardName: '',
        dateRange: []
      },
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      importDialogVisible: false,
      importForm: {
        file: null,
        fileName: ''
      },
      importRules: {
        file: [{ required: true, message: '请上传标准文件', trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadStandardList()
  },
  methods: {
    // 加载列表
    async loadStandardList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        if (this.queryForm.standardName) {
          params.standardName = this.queryForm.standardName.trim()
        }
        if (this.queryForm.dateRange && this.queryForm.dateRange.length === 2) {
          params.startTime = `${this.queryForm.dateRange[0]} 00:00:00`
          params.endTime = `${this.queryForm.dateRange[1]} 23:59:59`
        }
        const res = await getEvaluationViewList(params)
        if (res && (res.code === 200 || res.code === 0 || res.rows)) {
          this.tableData = res.rows || res.data || []
          this.total = res.total || 0
        } else {
          this.tableData = []
          this.total = 0
          this.$message.error(res && res.msg ? res.msg : '获取评价标准列表失败')
        }
      } catch (error) {
        console.error('获取评价标准列表失败:', error)
        this.$message.error('获取评价标准列表失败')
        this.tableData = []
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.currentPage = 1
      this.loadStandardList()
    },
    handleReset() {
      this.queryForm = {
        standardName: '',
        dateRange: []
      }
      this.currentPage = 1
      this.loadStandardList()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadStandardList()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.loadStandardList()
    },
    formatType(row) {
      return row.type || row.standardType || '--'
    },
    formatDate(dateStr) {
      if (!dateStr) return '--'
      return dateStr.length > 10 ? dateStr.slice(0, 10) : dateStr
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '--'
      return dateStr.replace('T', ' ')
    },
    getFileName(row) {
      if (!row) return '--'
      if (row.fileName) return row.fileName
      if (row.filePath) {
        const segments = row.filePath.split('/')
        return segments[segments.length - 1] || row.filePath
      }
      if (row.standardName) return `${row.standardName}.pdf`
      return '标准文件'
    },
    getRowKey(row) {
      if (row && row.id != null) return row.id
      return row && row.standardName ? row.standardName : Math.random().toString(36).slice(2)
    },
    openImportDialog() {
      this.importDialogVisible = true
      this.$nextTick(() => {
        this.$refs.importFormRef && this.$refs.importFormRef.clearValidate()
      })
    },
    triggerFileSelect() {
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.click()
      }
    },
    handleFileChange(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      const allowTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      const isAllowed =
        allowTypes.includes(file.type) ||
        /\.xls$|\.xlsx$|\.pdf$|\.doc$|\.docx$/i.test(file.name)
      const isLt10M = file.size / 1024 / 1024 <= 10
      if (!isAllowed) {
        this.$message.error('仅支持 Excel、Word 或 PDF 文件')
        event.target.value = ''
        return
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB')
        event.target.value = ''
        return
      }
      this.importForm.file = file
      this.importForm.fileName = file.name
      this.$refs.importFormRef && this.$refs.importFormRef.clearValidate('file')
      event.target.value = ''
    },
    resetImportForm() {
      this.importForm = {
        file: null,
        fileName: ''
      }
      this.$nextTick(() => {
        this.$refs.importFormRef && this.$refs.importFormRef.clearValidate()
      })
    },
    submitImport() {
      this.$refs.importFormRef.validate(async valid => {
        if (!valid) return
        const formData = new FormData()
        formData.append('file', this.importForm.file)
        this.importLoading = true
        try {
          const res = await importEvaluationStandard(formData)
          if (res && (res.code === 200 || res.code === 0)) {
            this.$message.success('导入成功')
            this.importDialogVisible = false
            this.loadStandardList()
          } else {
            this.$message.error(res && res.msg ? res.msg : '导入失败')
          }
        } catch (error) {
          console.error('导入评价标准文件失败:', error)
          this.$message.error('导入失败，请稍后重试')
        } finally {
          this.importLoading = false
        }
      })
    },
    async handleDownload(row) {
      if (!row || !row.id) {
        this.$message.warning('缺少文件ID，无法下载')
        return
      }
      this.downloadLoadingId = row.id
      try {
        const response = await downloadEvaluationStandard(row.id)
        const blob = new Blob([response])
        const fileName = this.getFileName(row)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        window.URL.revokeObjectURL(url)
        this.$message.success('下载成功')
      } catch (error) {
        console.error('下载评价标准文件失败:', error)
        this.$message.error('下载失败，请稍后再试')
      } finally {
        this.downloadLoadingId = null
      }
    }
  }
}
</script>

<style scoped>
.standards-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  padding-bottom: 0;
}

.filter-form .el-form-item {
  margin-right: 24px;
  margin-bottom: 12px;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-right {
  color: #909399;
  font-size: 14px;
}

.table-pagination {
  margin-top: 16px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

.file-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hidden-file-input {
  display: none;
}

.upload-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
