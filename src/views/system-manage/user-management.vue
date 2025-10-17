<template>
  <div class="user-management">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>用户名:</label>
        <el-input 
          v-model="searchForm.userName" 
          placeholder="请输入用户名"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <label>昵称:</label>
        <el-input 
          v-model="searchForm.nickName" 
          placeholder="请输入昵称"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <label>状态:</label>
        <el-select 
          v-model="searchForm.status" 
          placeholder="请选择状态"
          style="width: 120px; margin-right: 10px;"
          clearable
        >
          <el-option label="正常" value="0"></el-option>
          <el-option label="停用" value="1"></el-option>
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="addUser">新增</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
        <el-button type="success" @click="handleImport">导入</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="usersData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="userName" label="用户名" width="120" align="center"></el-table-column>
        <el-table-column prop="nickName" label="昵称" width="120" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" align="center"></el-table-column>
        <el-table-column prop="phonenumber" label="手机号" width="130" align="center"></el-table-column>
        <el-table-column prop="sex" label="性别" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.sex === '0' ? 'info' : scope.row.sex === '1' ? 'success' : 'warning'">
              {{ scope.row.sex === '0' ? '男' : scope.row.sex === '1' ? '女' : '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'0'"
              :inactive-value="'1'"
              active-text="正常"
              inactive-text="停用"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center"></el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editUser(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="resetPassword(scope.row)">重置密码</el-button>
            <el-button size="mini" type="danger" @click="deleteUser(scope.row)">删除</el-button>
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
    
    <!-- 新增/编辑用户对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="userForm" :rules="rules" ref="userForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="userForm.userName" placeholder="请输入用户名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="userForm.nickName" placeholder="请输入昵称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phonenumber">
              <el-input v-model="userForm.phonenumber" placeholder="请输入手机号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="userForm.sex">
                <el-radio label="0">男</el-radio>
                <el-radio label="1">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="userForm.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="deptId">
              <el-cascader
                v-model="userForm.deptId"
                :options="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children', checkStrictly: true }"
                placeholder="请选择部门"
                clearable
                style="width: 100%"
              ></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="密码" prop="password" v-if="dialogTitle === '新增用户'">
          <el-input type="password" v-model="userForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="userForm.remark" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser" :loading="saveLoading">保存</el-button>
      </div>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog title="重置密码" :visible.sync="resetPasswordVisible" width="400px">
      <el-form :model="resetForm" :rules="resetRules" ref="resetForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="resetForm.userName" disabled></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input type="password" v-model="resetForm.password" placeholder="请输入新密码"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword" :loading="resetLoading">确定</el-button>
      </div>
    </el-dialog>


    <!-- 导入用户对话框 -->
    <el-dialog title="导入用户" :visible.sync="importVisible" width="500px">
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :on-exceed="handleExceed"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :file-list="fileList"
        action="#"
        :auto-upload="false"
      >
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过500KB</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getUserList, 
  addUser, 
  updateUser, 
  deleteUser, 
  changeUserStatus, 
  resetUserPassword, 
  getDeptTree, 
  exportUser, 
  importUser, 
  downloadTemplate 
} from '@/api/user'

export default {
  name: 'UserManagement',
  data() {
    return {
      loading: false,
      saveLoading: false,
      resetLoading: false,
      searchForm: {
        userName: '',
        nickName: '',
        status: ''
      },
      usersData: [],
      selectedRows: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '新增用户',
      userForm: {
        userId: null,
        userName: '',
        nickName: '',
        email: '',
        phonenumber: '',
        sex: '0',
        status: '0',
        deptId: null,
        password: '',
        remark: ''
      },
      deptOptions: [],
      rules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phonenumber: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      // 重置密码相关
      resetPasswordVisible: false,
      resetForm: {
        userId: null,
        userName: '',
        password: ''
      },
      resetRules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      // 导入相关
      importVisible: false,
      fileList: []
    }
  },
  mounted() {
    this.loadData()
    this.loadDeptTree()
  },
  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }
        const response = await getUserList(params)
        if (response.code === 200 || response.code === 0) {
          this.usersData = response.rows || []
          this.total = response.total || 0
        }
      } catch (error) {
        this.$message.error('加载数据失败')
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    // 加载部门树
    async loadDeptTree() {
      try {
        const response = await getDeptTree()
        if (response.code === 200 || response.code === 0) {
          this.deptOptions = response.data || []
        }
      } catch (error) {
        console.error('加载部门树失败:', error)
      }
    },
    // 查询
    handleQuery() {
      this.currentPage = 1
      this.loadData()
    },
    // 重置
    handleReset() {
      this.searchForm = {
        userName: '',
        nickName: '',
        status: ''
      }
      this.currentPage = 1
      this.loadData()
    },
    // 导出
    async handleExport() {
      try {
        const response = await exportUser(this.searchForm)
        // 创建下载链接
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `用户列表_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败')
        console.error('导出失败:', error)
      }
    },
    // 导入
    handleImport() {
      this.importVisible = true
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadData()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },
    // 选择改变
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 新增用户
    addUser() {
      this.dialogTitle = '新增用户'
      this.userForm = {
        userId: null,
        userName: '',
        nickName: '',
        email: '',
        phonenumber: '',
        sex: '0',
        status: '0',
        deptId: null,
        password: '',
        remark: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm && this.$refs.userForm.clearValidate()
      })
    },
    // 编辑用户
    editUser(row) {
      this.dialogTitle = '编辑用户'
      this.userForm = { ...row }
      this.userForm.password = '' // 编辑时不显示密码
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm && this.$refs.userForm.clearValidate()
      })
    },
    // 删除用户
    deleteUser(row) {
      this.$confirm(`确定要删除用户 "${row.userName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteUser(row.userId)
          if (response.code === 200 || response.code === 0) {
            this.$message.success('删除成功')
            this.loadData()
          }
        } catch (error) {
          this.$message.error('删除失败')
          console.error('删除失败:', error)
        }
      })
    },
    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的数据')
        return
      }
      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const userIds = this.selectedRows.map(row => row.userId).join(',')
          const response = await deleteUser(userIds)
          if (response.code === 200 || response.code === 0) {
            this.$message.success('批量删除成功')
            this.loadData()
          }
        } catch (error) {
          this.$message.error('批量删除失败')
          console.error('批量删除失败:', error)
        }
      })
    },
    // 保存用户
    async saveUser() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          this.saveLoading = true
          try {
            let response
            if (this.userForm.userId) {
              // 编辑
              response = await updateUser(this.userForm)
            } else {
              // 新增
              response = await addUser(this.userForm)
            }
            if (response.code === 200 || response.code === 0) {
              this.$message.success(this.userForm.userId ? '修改成功' : '新增成功')
              this.dialogVisible = false
              this.loadData()
            }
          } catch (error) {
            this.$message.error(this.userForm.userId ? '修改失败' : '新增失败')
            console.error('保存失败:', error)
          } finally {
            this.saveLoading = false
          }
        } else {
          this.$message.error('请填写完整信息')
        }
      })
    },
    // 状态改变
    async handleStatusChange(row) {
      try {
        const response = await changeUserStatus({
          userId: row.userId,
          status: row.status
        })
        if (response.code === 200 || response.code === 0) {
          this.$message.success('状态修改成功')
        } else {
          // 如果失败，恢复原状态
          row.status = row.status === '0' ? '1' : '0'
        }
      } catch (error) {
        this.$message.error('状态修改失败')
        // 恢复原状态
        row.status = row.status === '0' ? '1' : '0'
        console.error('状态修改失败:', error)
      }
    },
    // 重置密码
    resetPassword(row) {
      this.resetForm = {
        userId: row.userId,
        userName: row.userName,
        password: ''
      }
      this.resetPasswordVisible = true
      this.$nextTick(() => {
        this.$refs.resetForm && this.$refs.resetForm.clearValidate()
      })
    },
    // 确认重置密码
    async confirmResetPassword() {
      this.$refs.resetForm.validate(async (valid) => {
        if (valid) {
          this.resetLoading = true
          try {
            const response = await resetUserPassword(this.resetForm)
            if (response.code === 200 || response.code === 0) {
              this.$message.success('密码重置成功')
              this.resetPasswordVisible = false
            }
          } catch (error) {
            this.$message.error('密码重置失败')
            console.error('密码重置失败:', error)
          } finally {
            this.resetLoading = false
          }
        }
      })
    },
    // 文件上传相关
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel'
      const isLt500K = file.size / 1024 < 500

      if (!isExcel) {
        this.$message.error('只能上传 Excel 文件!')
        return false
      }
      if (!isLt500K) {
        this.$message.error('上传文件大小不能超过 500KB!')
        return false
      }
      return true
    },
    handleUploadSuccess(response, file, fileList) {
      this.$message.success('导入成功')
      this.importVisible = false
      this.loadData()
    },
    handleUploadError(error, file, fileList) {
      this.$message.error('导入失败')
      console.error('导入失败:', error)
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    // 下载模板
    async downloadTemplate() {
      try {
        const response = await downloadTemplate()
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '用户导入模板.xlsx'
        link.click()
        window.URL.revokeObjectURL(url)
        this.$message.success('模板下载成功')
      } catch (error) {
        this.$message.error('模板下载失败')
        console.error('模板下载失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.user-management {
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
