<template>
  <div class="user-management">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>用户名:</label>
        <el-input 
          v-model="searchForm.username" 
          placeholder="请输入用户名"
          style="width: 200px; margin-right: 10px;"
          clearable
        >
        </el-input>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="addUser">新增</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
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
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120" align="center"></el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="120" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" align="center"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" align="center"></el-table-column>
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.role === '管理员' ? 'danger' : 'primary'">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editUser(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewUser(scope.row)">详情</el-button>
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
    
    <!-- 新增/编辑用户对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="userForm" :rules="rules" ref="userForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="userForm.realName" placeholder="请输入真实姓名"></el-input>
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
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" placeholder="请选择角色">
                <el-option label="管理员" value="管理员"></el-option>
                <el-option label="操作员" value="操作员"></el-option>
                <el-option label="查看员" value="查看员"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="userForm.status">
                <el-radio label="启用">启用</el-radio>
                <el-radio label="禁用">禁用</el-radio>
              </el-radio-group>
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
        <el-button type="primary" @click="saveUser">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        username: ''
      },
      usersData: [
        {
          id: 1,
          username: 'admin',
          realName: '系统管理员',
          email: 'admin@example.com',
          phone: '13800138000',
          role: '管理员',
          status: '启用',
          createTime: '2024-01-01',
          remark: '系统超级管理员'
        },
        {
          id: 2,
          username: 'operator1',
          realName: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138001',
          role: '操作员',
          status: '启用',
          createTime: '2024-01-15',
          remark: '数据录入操作员'
        },
        {
          id: 3,
          username: 'viewer1',
          realName: '李四',
          email: 'lisi@example.com',
          phone: '13800138002',
          role: '查看员',
          status: '启用',
          createTime: '2024-02-01',
          remark: '数据查看员'
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 3,
      dialogVisible: false,
      dialogTitle: '新增用户',
      userForm: {
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: '',
        status: '启用',
        password: '',
        remark: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
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
      this.searchForm.username = ''
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
    // 新增用户
    addUser() {
      this.dialogTitle = '新增用户'
      this.userForm = {
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: '',
        status: '启用',
        password: '',
        remark: ''
      }
      this.dialogVisible = true
    },
    // 编辑用户
    editUser(row) {
      this.dialogTitle = '编辑用户'
      this.userForm = { ...row }
      this.userForm.password = '' // 编辑时不显示密码
      this.dialogVisible = true
    },
    // 查看用户
    viewUser(row) {
      this.$message.info(`查看用户: ${row.realName}`)
    },
    // 保存用户
    saveUser() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.$message.success('用户信息保存成功')
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
