<template>
  <div class="comprehensive-analysis">
    <!-- 查询条件 -->
    <el-card class="query-card">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="所属项目">
          <el-select v-model="queryForm.project" placeholder="请选择项目" clearable>
            <el-option label="全部" value="全部"></el-option>
            <el-option label="项目A" value="项目A"></el-option>
            <el-option label="项目B" value="项目B"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监测井选择">
          <el-select v-model="queryForm.well" placeholder="请选择监测井" clearable>
            <el-option label="全部" value="全部"></el-option>
            <el-option label="监测井A" value="监测井A"></el-option>
            <el-option label="监测井B" value="监测井B"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监测项目">
          <el-select v-model="queryForm.monitoringItems" placeholder="请选择监测项目" clearable multiple>
            <el-option label="高猛酸盐" value="高猛酸盐"></el-option>
            <el-option label="总磷" value="总磷"></el-option>
            <el-option label="总氮" value="总氮"></el-option>
            <el-option label="氨氮" value="氨氮"></el-option>
            <el-option label="pH" value="pH"></el-option>
            <el-option label="溶解氧" value="溶解氧"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间选择">
          <el-select v-model="queryForm.timeRange" placeholder="请选择时间范围" clearable>
            <el-option label="近三天" value="近三天"></el-option>
            <el-option label="近一周" value="近一周"></el-option>
            <el-option label="近一月" value="近一月"></el-option>
            <el-option label="近三月" value="近三月"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="exportMonitoringResults">导出监测结果</el-button>
          <el-button type="primary" @click="exportEvaluationResults">导出评价结果</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 子标签页 -->
    <el-tabs v-model="activeTab" class="analysis-tabs">
      <el-tab-pane label="监测结果" name="monitoring">
        <i slot="label" class="el-icon-s-grid"></i>
      </el-tab-pane>
      <el-tab-pane label="评价结果" name="evaluation">
        <i slot="label" class="el-icon-star-on"></i>
      </el-tab-pane>
      <el-tab-pane label="报图" name="chart">
        <i slot="label" class="el-icon-data-line"></i>
      </el-tab-pane>
    </el-tabs>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="monitoringData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="station" label="站点" width="100" align="center"></el-table-column>
        <el-table-column prop="time" label="时间" width="150" align="center"></el-table-column>
        <el-table-column prop="waterTemp" label="水温(°C)" width="100" align="center"></el-table-column>
        <el-table-column prop="turbidity" label="浊度(NTU)" width="100" align="center"></el-table-column>
        <el-table-column prop="ph" label="pH" width="80" align="center"></el-table-column>
        <el-table-column prop="dissolvedOxygen" label="溶解氧(mg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="conductivity" label="电导率(uS/cm)" width="120" align="center"></el-table-column>
        <el-table-column prop="chlorophyll" label="叶绿素(mg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="cyanobacteria" label="蓝绿藻(µg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="permanganate" label="高锰酸盐(mg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="totalPhosphorus" label="总磷(mg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="totalNitrogen" label="总氮(mg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="ammoniaNitrogen" label="氨氮(mg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="totalIron" label="总铁(mg/L)" width="120" align="center"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ComprehensiveAnalysis',
  data() {
    return {
      loading: false,
      activeTab: 'monitoring',
      queryForm: {
        project: '',
        well: '',
        monitoringItems: [],
        timeRange: ''
      },
      monitoringData: [
        {
          id: 1,
          station: 'A',
          time: '2023-03-26 20:12',
          waterTemp: 23,
          turbidity: 10,
          ph: 7.2,
          dissolvedOxygen: 0.22,
          conductivity: 22.1,
          chlorophyll: 1.2,
          cyanobacteria: 0.01,
          permanganate: 1.98,
          totalPhosphorus: 0.11,
          totalNitrogen: 3.6,
          ammoniaNitrogen: 0.174,
          totalIron: 0.34
        },
        {
          id: 2,
          station: 'B',
          time: '2023-06-08 16:42',
          waterTemp: 23,
          turbidity: 10,
          ph: 7.2,
          dissolvedOxygen: 0.22,
          conductivity: 22.1,
          chlorophyll: 1.2,
          cyanobacteria: 0.01,
          permanganate: 1.98,
          totalPhosphorus: 0.11,
          totalNitrogen: 3.6,
          ammoniaNitrogen: 0.174,
          totalIron: 0.34
        },
        {
          id: 3,
          station: 'C',
          time: '2023-12-15 02:36',
          waterTemp: 23,
          turbidity: 10,
          ph: 7.2,
          dissolvedOxygen: 0.22,
          conductivity: 22.1,
          chlorophyll: 1.2,
          cyanobacteria: 0.01,
          permanganate: 1.98,
          totalPhosphorus: 0.11,
          totalNitrogen: 3.6,
          ammoniaNitrogen: 0.174,
          totalIron: 0.34
        }
      ],
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
        project: '',
        well: '',
        monitoringItems: [],
        timeRange: ''
      }
    },
    exportMonitoringResults() {
      this.$message.success('导出监测结果功能')
    },
    exportEvaluationResults() {
      this.$message.success('导出评价结果功能')
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    }
  }
}
</script>

<style scoped>
.comprehensive-analysis {
  height: 100%;
}

.query-card {
  margin-bottom: 20px;
}

.query-form {
  margin-bottom: 0;
}

.export-buttons {
  margin-bottom: 20px;
}

.export-buttons .el-button {
  margin-right: 10px;
}

.analysis-tabs {
  margin-bottom: 20px;
}

.table-card {
  flex: 1;
}
</style>
