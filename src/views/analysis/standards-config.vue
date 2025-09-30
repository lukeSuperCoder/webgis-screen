<template>
  <div class="standards-config">
    <!-- 查询条件 -->
    <el-card class="query-card">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="配值查询">
          <el-select v-model="queryForm.indicator" placeholder="请选择监测项目" clearable>
            <el-option label="ph" value="ph"></el-option>
            <el-option label="氨氮" value="氨氮"></el-option>
            <el-option label="溶解氧" value="溶解氧"></el-option>
            <el-option label="高酸盐" value="高酸盐"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button @click="toggleExpand">展开</el-button>
          <el-button type="primary" @click="addStandard">新增</el-button>
          <el-button type="primary" @click="exportData">导出</el-button>
    </el-form-item>
      </el-form>
    </el-card>

    <!-- 标准列表 -->
    <el-card class="table-card">
      <div slot="header">
        <span>已配置标准列表</span>
        <div class="header-actions">
          <el-button type="primary" size="small" @click="exportData">导出</el-button>
          <el-button type="danger" size="small" @click="batchDelete">批量删除</el-button>
        </div>
      </div>
      
      <el-table 
        :data="standardsData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="referenceStandard" label="参考标准" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="monitoringItem" label="监测项目名称" width="120" align="center"></el-table-column>
        <el-table-column prop="classI" label="I" width="80" align="center"></el-table-column>
        <el-table-column prop="classII" label="II" width="80" align="center"></el-table-column>
        <el-table-column prop="classIII" label="III" width="80" align="center"></el-table-column>
        <el-table-column prop="classIV" label="IV" width="80" align="center"></el-table-column>
        <el-table-column prop="classV" label="V" width="80" align="center"></el-table-column>
        <el-table-column prop="inferiorV" label="劣V" width="80" align="center"></el-table-column>
        <el-table-column prop="enabled" label="是否启用" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'danger'" size="small">
              {{ scope.row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editStandard(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewDetail(scope.row)">详情</el-button>
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
  name: 'StandardsConfig',
  data() {
    return {
      loading: false,
      queryForm: {
        indicator: ''
      },
      standardsData: [
        {
          id: 1,
          referenceStandard: 'GB3838-2002地表水环境质量标准',
          monitoringItem: '氨氮',
          classI: '[0,0.15]',
          classII: '[0.15,0.5]',
          classIII: '[0.5,1]',
          classIV: '[1,1.5]',
          classV: '[1.5,2]',
          inferiorV: '[2,]',
          enabled: true
        },
        {
          id: 2,
          referenceStandard: 'GB3838-2002地表水环境质量标准',
          monitoringItem: '溶解氧',
          classI: '[7.5,10]',
          classII: '[6,7.5]',
          classIII: '[5,6]',
          classIV: '[3,5]',
          classV: '[2,3]',
          inferiorV: '[0,2]',
          enabled: true
        },
        {
          id: 3,
          referenceStandard: 'GB3838-2002地表水环境质量标准',
          monitoringItem: '高酸盐',
          classI: '[0,2]',
          classII: '[2,4]',
          classIII: '[4,6]',
          classIV: '[6,10]',
          classV: '[10,15]',
          inferiorV: '[15,]',
          enabled: true
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 3,
      selectedRows: []
    }
  },
  methods: {
    queryData() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$message.success('查询完成')
      }, 1000)
    },
    resetQuery() {
      this.queryForm = {
        indicator: ''
      }
    },
    toggleExpand() {
      this.$message.info('展开功能')
    },
    addStandard() {
      this.$message.info('新增标准功能')
    },
    editStandard(row) {
      this.$message.info(`编辑标准: ${row.monitoringItem}`)
    },
    viewDetail(row) {
      this.$message.info(`查看详情: ${row.monitoringItem}`)
    },
    exportData() {
      this.$message.success('导出功能')
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
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
.standards-config {
  height: 100%;
}

.query-card {
  margin-bottom: 20px;
}

.query-form {
  margin-bottom: 0;
}

.form-card {
  margin-bottom: 20px;
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

.action-buttons {
  margin-bottom: 20px;
}

.action-buttons .el-button {
  margin-right: 10px;
}
</style>
