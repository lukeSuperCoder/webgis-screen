<template>
  <PageLayout
    title="评价分析"
    :menu-items="menuItems"
    :current-page-title="currentPageTitle"
    :current-page-desc="currentPageDesc"
  />
</template>

<script>
import PageLayout from '@/components/PageLayout.vue'

export default {
  name: 'Analysis',
  components: {
    PageLayout
  },
  data() {
    return {
      menuItems: [
        {
          key: '/analysis/standards',
          title: '评价标准查看',
          icon: 'el-icon-view'
        },
        {
          key: '/analysis/standards-config',
          title: '评价标准配置',
          icon: 'el-icon-setting'
        },
        {
          key: '/analysis/comprehensive',
          title: '综合评价分析',
          icon: 'el-icon-data-analysis'
        },
        {
          key: '/analysis/single-site-multi-factor',
          title: '单站点多要素分析',
          icon: 'el-icon-location'
        },
        {
          key: '/analysis/single-site-comparison',
          title: '单站点同环比分析',
          icon: 'el-icon-pie-chart'
        },
        {
          key: '/analysis/multi-site-single-factor',
          title: '多站点单要素分析',
          icon: 'el-icon-map-location'
        }
      ]
    }
  },
  computed: {
    currentPageTitle() {
      const routeMap = {
        '/analysis/standards': '评价标准查看',
        '/analysis/standards-config': '评价标准配置',
        '/analysis/comprehensive': '综合评价分析',
        '/analysis/single-site-multi-factor': '单站点多要素分析',
        '/analysis/single-site-comparison': '单站点同环比分析',
        '/analysis/multi-site-single-factor': '多站点单要素分析'
      }
      return routeMap[this.$route.path] || '评价分析'
    },
    currentPageDesc() {
      const descMap = {
        '/analysis/standards': '查看当前水质评价标准',
        '/analysis/standards-config': '配置水质评价标准参数',
        '/analysis/comprehensive': '进行综合水质评价分析',
        '/analysis/single-site-multi-factor': '分析单个监测站点的多要素数据',
        '/analysis/single-site-comparison': '对比分析单个站点的时间序列数据',
        '/analysis/multi-site-single-factor': '分析多个站点的单一要素数据'
      }
      return descMap[this.$route.path] || '水质评价分析功能'
    }
  }
}
</script>
