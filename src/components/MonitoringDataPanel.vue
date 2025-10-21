<template>
  <div class="monitoring-data-panel">
    <div class="panel-overlay" @click="closePanel"></div>
    <div class="panel-content">
      <!-- 头部 -->
      <div class="panel-header">
        <div class="filters">
          <div class="filter-row">
            <div class="filter-item">
              <label>所属项目:</label>
              <select v-model="filters.project">
                <option value="all">全部</option>
                <option value="project1">项目1</option>
                <option value="project2">项目2</option>
              </select>
            </div>
            <div class="filter-item">
              <label>监测井选择:</label>
              <select v-model="filters.well">
                <option value="all">全部</option>
                <option value="well1">库都尔</option>
                <option value="well2">西乌</option>
                <option value="well3">诺敏</option>
              </select>
            </div>
            <div class="filter-item">
              <label>时间选择:</label>
              <input type="date" v-model="filters.startDate" />
              <span>至</span>
              <input type="date" v-model="filters.endDate" />
            </div>
          </div>
        </div>
        <button class="close-btn" @click="closePanel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 表格 -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>站点名称</th>
              <th>监测时间</th>
              <th>水温(°C)</th>
              <th>浊度(NTU)</th>
              <th>pH</th>
              <th>溶解氧(mg/L)</th>
              <th>叶绿素(µ/L)</th>
              <th>高猛酸盐(mg/L)</th>
              <th>总磷(mg/L)</th>
              <th>总氮(mg/L)</th>
              <th>氨氮(mg/L)</th>
              <th>总铁(mg/L)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableData" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ row.stationName }}</td>
              <td>{{ row.monitorTime }}</td>
              <td>{{ row.waterTemp }}</td>
              <td>{{ row.turbidity }}</td>
              <td>{{ row.ph }}</td>
              <td :class="getHighlightClass(row.dissolvedOxygen, 'dissolvedOxygen')">{{ row.dissolvedOxygen }}</td>
              <td :class="getHighlightClass(row.chlorophyll, 'chlorophyll')">{{ row.chlorophyll }}</td>
              <td>{{ row.permanganate }}</td>
              <td>{{ row.totalPhosphorus }}</td>
              <td :class="getHighlightClass(row.totalNitrogen, 'totalNitrogen')">{{ row.totalNitrogen }}</td>
              <td>{{ row.ammoniaNitrogen }}</td>
              <td>{{ row.totalIron }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonitoringDataPanel',
  data() {
    return {
      filters: {
        project: 'all',
        well: 'all',
        startDate: '2025-01-01',
        endDate: '2025-12-30'
      },
      tableData: [
        {
          stationName: '库都尔',
          monitorTime: '2023-01-30 15:30:34',
          waterTemp: 18.21,
          turbidity: 28.96,
          ph: 6.94,
          dissolvedOxygen: 9.55,
          chlorophyll: 52.75,
          permanganate: 3.03,
          totalPhosphorus: 0.07,
          totalNitrogen: 0.99,
          ammoniaNitrogen: 0.15,
          totalIron: 0.29
        },
        {
          stationName: '西乌',
          monitorTime: '2023-01-30 15:30:34',
          waterTemp: 18.24,
          turbidity: 31.21,
          ph: 7.00,
          dissolvedOxygen: 9.79,
          chlorophyll: 53.99,
          permanganate: 3.20,
          totalPhosphorus: 0.15,
          totalNitrogen: 0.85,
          ammoniaNitrogen: 0.12,
          totalIron: 0.30
        },
        {
          stationName: '诺敏',
          monitorTime: '2023-01-30 15:30:34',
          waterTemp: 18.15,
          turbidity: 25.43,
          ph: 6.88,
          dissolvedOxygen: 9.12,
          chlorophyll: 48.33,
          permanganate: 2.95,
          totalPhosphorus: 0.09,
          totalNitrogen: 0.92,
          ammoniaNitrogen: 0.18,
          totalIron: 0.27
        },
        {
          stationName: '伊敏河',
          monitorTime: '2023-01-30 15:30:34',
          waterTemp: 18.33,
          turbidity: 29.87,
          ph: 7.05,
          dissolvedOxygen: 9.45,
          chlorophyll: 51.22,
          permanganate: 3.15,
          totalPhosphorus: 0.12,
          totalNitrogen: 1.79,
          ammoniaNitrogen: 0.14,
          totalIron: 0.31
        },
        {
          stationName: '扎拖',
          monitorTime: '2023-01-30 15:30:34',
          waterTemp: 18.18,
          turbidity: 27.65,
          ph: 6.92,
          dissolvedOxygen: 9.33,
          chlorophyll: 49.88,
          permanganate: 3.08,
          totalPhosphorus: 0.11,
          totalNitrogen: 0.88,
          ammoniaNitrogen: 0.16,
          totalIron: 0.28
        },
        {
          stationName: '三河',
          monitorTime: '2023-01-30 15:30:34',
          waterTemp: 18.26,
          turbidity: 30.12,
          ph: 6.97,
          dissolvedOxygen: 8.68,
          chlorophyll: 50.45,
          permanganate: 3.12,
          totalPhosphorus: 0.13,
          totalNitrogen: 0.95,
          ammoniaNitrogen: 0.17,
          totalIron: 0.29
        }
      ]
    }
  },
  methods: {
    closePanel() {
      this.$emit('close');
    },
    getHighlightClass(value, type) {
      // 根据设计图中的高亮规则
      if (type === 'chlorophyll' && value > 53) {
        return 'highlight-yellow';
      }
      if (type === 'totalNitrogen' && value > 1.5) {
        return 'highlight-blue';
      }
      if (type === 'dissolvedOxygen' && value < 9) {
        return 'highlight-red';
      }
      return '';
    }
  }
}
</script>

<style scoped>
.monitoring-data-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.panel-content {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.filters {
  flex: 1;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.filter-item select,
.filter-item input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-item input[type="date"] {
  width: 140px;
}

.filter-item span {
  margin: 0 5px;
  color: #666;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.table-container {
  flex: 1;
  overflow: auto;
  padding: 0 20px 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #f5f5f5;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #333;
  border: 1px solid #e5e5e5;
  white-space: nowrap;
}

.data-table td {
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #e5e5e5;
  white-space: nowrap;
}

.data-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.data-table tbody tr:hover {
  background: #f0f8ff;
}

/* 高亮样式 */
.highlight-yellow {
  background-color: #fff3cd !important;
  color: #856404;
  font-weight: 600;
}

.highlight-blue {
  background-color: #d1ecf1 !important;
  color: #0c5460;
  font-weight: 600;
}

.highlight-red {
  background-color: #f8d7da !important;
  color: #721c24;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 1200px) {
  .panel-content {
    width: 95%;
  }
  
  .filter-row {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 6px;
  }
}
</style>
