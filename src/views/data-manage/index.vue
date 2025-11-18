<template>
  <PageLayout
    title="数据管理"
    :menu-items="menuItems"
    :current-page-title="currentPageTitle"
    :current-page-desc="currentPageDesc"
  />
</template>

<script>
import PageLayout from '@/components/PageLayout.vue'

export default {
  name: 'DataManage',
  components: {
    PageLayout
  },
  data() {
    return {
      menuItems: [
        {
          key: '/data/quality-rules',
          title: '数据质控规则',
          icon: 'el-icon-s-check'
        },
        {
          key: '/data/well-management',
          title: '监测井数据管理',
          icon: 'el-icon-location'
        },
        {
          key: '/data/water-source-management',
          title: '水源地数据管理',
          icon: 'el-icon-coordinate'
        },
        {
          key: '/data/monitoring-data',
          title: '监测数据管理',
          icon: 'el-icon-data-line'
        },
        {
          key: '/data/project-config',
          title: '监测项目数据管理',
          icon: 'el-icon-setting'
        },
        {
          key: '/data/pollution-metric',
          title: '检测项目配置',
          icon: 'el-icon-magic-stick'
        }
      ]
    }
  },
  computed: {
    currentPageTitle() {
      const routeMap = {
        '/data/quality-rules': '数据质控规则',
        '/data/well-management': '监测井数据管理',
        '/data/water-source-management': '水源地数据管理',
        '/data/monitoring-data': '监测数据管理',
        '/data/project-config': '监测项目数据管理',
        '/data/pollution-metric': '检测项目配置'
      }
      return routeMap[this.$route.path] || '数据管理'
    },
    currentPageDesc() {
      const descMap = {
        '/data/quality-rules': '配置数据质量控制规则',
        '/data/well-management': '管理监测井基础信息',
        '/data/water-source-management': '管理水源地基础信息及边界',
        '/data/monitoring-data': '录入、查询和管理监测数据',
        '/data/project-config': '配置监测项目参数',
        '/data/pollution-metric': '配置污染物指标及导入导出'
      }
      return descMap[this.$route.path] || '数据管理功能'
    }
  }
}
</script>
