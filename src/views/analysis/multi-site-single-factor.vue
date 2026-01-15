<template>
  <div class="multi-site-single-factor">
    <!-- 查询条件 -->
    <el-card class="query-card">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="监测类型">
          <el-radio-group v-model="queryForm.monitoringType">
            <el-radio label="水质">水质</el-radio>
            <el-radio label="水文">水文</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据频率">
          <el-select v-model="queryForm.dataFrequency" placeholder="请选择数据频率" clearable>
            <el-option label="4小时" value="4小时"></el-option>
            <el-option label="8小时" value="8小时"></el-option>
            <el-option label="12小时" value="12小时"></el-option>
            <el-option label="24小时" value="24小时"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间选择">
          <el-select v-model="queryForm.timeSelection" placeholder="请选择时间" clearable>
            <el-option label="近三天" value="近三天"></el-option>
            <el-option label="近一周" value="近一周"></el-option>
            <el-option label="近一月" value="近一月"></el-option>
            <el-option label="近三月" value="近三月"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.timeRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="监测项目">
          <el-select v-model="queryForm.monitoringItem" placeholder="请选择监测项目" clearable>
            <el-option label="水温" value="水温"></el-option>
            <el-option label="pH" value="pH"></el-option>
            <el-option label="溶解氧" value="溶解氧"></el-option>
            <el-option label="氨氮" value="氨氮"></el-option>
            <el-option label="总磷" value="总磷"></el-option>
            <el-option label="总氮" value="总氮"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="站点选择">
          <el-select v-model="queryForm.sites" placeholder="请选择站点" clearable multiple>
            <el-option label="站点A" value="站点A"></el-option>
            <el-option label="站点B" value="站点B"></el-option>
            <el-option label="站点C" value="站点C"></el-option>
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
        :data="analysisData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="monitoringItem" label="监测项目" width="120" align="center"></el-table-column>
        <el-table-column prop="site" label="站点" width="100" align="center"></el-table-column>
        <el-table-column prop="timestamp" label="时间戳" width="150" align="center"></el-table-column>
        <el-table-column prop="date1" label="2021-12-04" width="100" align="center"></el-table-column>
        <el-table-column prop="date2" label="2021-12-05" width="100" align="center"></el-table-column>
        <el-table-column prop="date3" label="2021-12-06" width="100" align="center"></el-table-column>
        <el-table-column prop="date4" label="2021-12-07" width="100" align="center"></el-table-column>
        <el-table-column prop="date5" label="2021-12-08" width="100" align="center"></el-table-column>
        <el-table-column prop="date6" label="2021-12-09" width="100" align="center"></el-table-column>
        <el-table-column prop="date7" label="2021-12-10" width="100" align="center"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MultiSiteSingleFactor',
  data() {
    return {
      loading: false,
      activeTab: 'monitoring',
      queryForm: {
        monitoringType: '水质',
        dataFrequency: '',
        timeSelection: '',
        timeRange: [],
        monitoringItem: '',
        sites: []
      },
      analysisData: [
        {
          id: 1,
          monitoringItem: '水温(°C)',
          site: '站点A',
          timestamp: '2023-03-26 20:12',
          date1: 20.2,
          date2: 19.1,
          date3: 18.2,
          date4: 20.2,
          date5: 18.2,
          date6: 20.2,
          date7: null
        },
        {
          id: 2,
          monitoringItem: '水温(°C)',
          site: '站点B',
          timestamp: '2023-06-08 16:42',
          date1: 19,
          date2: 22,
          date3: 21,
          date4: 17,
          date5: 16.1,
          date6: 14.1,
          date7: null
        },
        {
          id: 3,
          monitoringItem: '水温(°C)',
          site: '站点C',
          timestamp: '2023-12-15 02:36',
          date1: 18,
          date2: 15,
          date3: 13,
          date4: 12.2,
          date5: 15.2,
          date6: 16.2,
          date7: null
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
        monitoringType: '水质',
        dataFrequency: '',
        timeSelection: '',
        timeRange: [],
        monitoringItem: '',
        sites: []
      }
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    }
  }
}
</script>

<style scoped>
.multi-site-single-factor {
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
