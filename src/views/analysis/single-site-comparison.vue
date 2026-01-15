<template>
  <div class="single-site-comparison">
    <!-- 查询条件 -->
    <el-card class="query-card">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="对比类型">
          <el-radio-group v-model="queryForm.comparisonType">
            <el-radio label="同比分析">同比分析</el-radio>
            <el-radio label="环比分析">环比分析</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="站点选择">
          <el-select v-model="queryForm.station" placeholder="请选择站点" clearable>
            <el-option label="站点A" value="站点A"></el-option>
            <el-option label="站点B" value="站点B"></el-option>
            <el-option label="站点C" value="站点C"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间类型">
          <el-select v-model="queryForm.timeType" placeholder="请选择时间类型" clearable>
            <el-option label="月度" value="月度"></el-option>
            <el-option label="季度" value="季度"></el-option>
            <el-option label="年度" value="年度"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.timeRange"
            type="month"
            placeholder="请选择时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="监测类型">
          <el-radio-group v-model="queryForm.monitoringType">
            <el-radio label="水质">水质</el-radio>
            <el-radio label="水文">水文</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="监测项目">
          <el-select v-model="queryForm.monitoringItems" placeholder="请选择监测项目" clearable multiple>
            <el-option label="叶绿素" value="叶绿素"></el-option>
            <el-option label="溶解氧" value="溶解氧"></el-option>
            <el-option label="pH" value="pH"></el-option>
            <el-option label="氨氮" value="氨氮"></el-option>
            <el-option label="总磷" value="总磷"></el-option>
            <el-option label="总氮" value="总氮"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 子标签页 -->
    <el-tabs v-model="activeTab" class="analysis-tabs">
      <el-tab-pane label="监测结果" name="monitoring">
        <i slot="label" class="el-icon-s-grid"></i>
      </el-tab-pane>
      <el-tab-pane label="报图" name="chart">
        <i slot="label" class="el-icon-data-line"></i>
      </el-tab-pane>
    </el-tabs>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="comparisonData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="station" label="站点" width="100" align="center"></el-table-column>
        <el-table-column prop="time" label="时间" width="100" align="center"></el-table-column>
        <el-table-column prop="dissolvedOxygen" label="溶解氧 (mg/L)" width="120" align="center"></el-table-column>
        <el-table-column prop="chlorophyll" label="叶绿素 (mg/L)" width="120" align="center"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SingleSiteComparison',
  data() {
    return {
      loading: false,
      activeTab: 'monitoring',
      queryForm: {
        comparisonType: '同比分析',
        station: '',
        timeType: '',
        timeRange: null,
        monitoringType: '水质',
        monitoringItems: []
      },
      comparisonData: [
        {
          id: 1,
          station: '2021-12',
          time: '本期',
          dissolvedOxygen: 0.21,
          chlorophyll: 1.0
        },
        {
          id: 2,
          station: '2020-12',
          time: '上期',
          dissolvedOxygen: 0.18,
          chlorophyll: 2.2
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
        comparisonType: '同比分析',
        station: '',
        timeType: '',
        timeRange: null,
        monitoringType: '水质',
        monitoringItems: []
      }
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    }
  }
}
</script>

<style scoped>
.single-site-comparison {
  height: 100%;
}

.query-card {
  margin-bottom: 20px;
}

.query-form {
  margin-bottom: 0;
}

.analysis-tabs {
  margin-bottom: 20px;
}

.table-card {
  flex: 1;
}
</style>
