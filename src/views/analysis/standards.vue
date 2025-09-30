<template>
  <div class="standards-view">
    <!-- 查询条件 -->
    <el-card class="query-card">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="标准名称">
          <el-select v-model="queryForm.standardName" placeholder="请选择标准名称" clearable>
            <el-option label="国家标准-GB3838-2002地表水环境质量标准" value="国家标准-GB3838-2002地表水环境质量标准"></el-option>
            <el-option label="国家标准-GB/T 14848-2017 地下水质量标准" value="国家标准-GB/T 14848-2017 地下水质量标准"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标准列表 -->
    <el-card class="table-card">
      <div slot="header">
        <span>评价标准列表</span>
        <div class="header-actions">
          <el-button type="primary" size="small" @click="exportData">导出</el-button>
          <el-button type="success" size="small" @click="addStandard">新增标准</el-button>
        </div>
      </div>
      
      <el-table 
        :data="standardsData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border>
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="planName" label="评价方案名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="standardNature" label="标准性质" width="100" align="center"></el-table-column>
        <el-table-column prop="type" label="类型" width="120" align="center"></el-table-column>
        <el-table-column prop="executionDate" label="执行日期" width="120" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editStandard(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="downloadStandard(scope.row)">下载</el-button>
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
  </div>
</template>

<script>
export default {
  name: 'StandardsView',
  data() {
    return {
      loading: false,
      queryForm: {
        standardName: ''
      },
      standardsData: [
        {
          id: 1,
          planName: '国家标准-GB3838-2002地表水环境质量标准',
          standardNature: '国家',
          type: '地表水水质',
          executionDate: ''
        },
        {
          id: 2,
          planName: '国家标准-GB/T 14848-2017 地下水质量标准',
          standardNature: '国家',
          type: '地下水水质',
          executionDate: ''
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 3
    }
  },
  methods: {
    queryData() {
      this.loading = true
      // 模拟查询
      setTimeout(() => {
        this.loading = false
        this.$message.success('查询完成')
      }, 1000)
    },
    resetQuery() {
      this.queryForm = {
        standardName: ''
      }
    },
    editStandard(row) {
      this.$message.info(`编辑标准: ${row.planName}`)
    },
    downloadStandard(row) {
      this.$message.success(`下载标准: ${row.planName}`)
    },
    addStandard() {
      this.$message.info('新增标准功能')
    },
    exportData() {
      this.$message.success('导出功能')
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>

<style scoped>
.standards-view {
  height: 100%;
}

.query-card {
  margin-bottom: 20px;
}

.query-form {
  margin-bottom: 0;
}

.table-card {
  flex: 1;
}

.header-actions {
  float: right;
}

.header-actions .el-button {
  margin-left: 10px;
}
</style>
