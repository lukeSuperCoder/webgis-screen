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
          key: '/analysis/comprehensive',
          title: '综合评价分析',
          icon: 'el-icon-data-analysis'
        },
        {
          key: '/analysis/standards',
          title: '评价标准查看',
          icon: 'el-icon-data-line'
        },
        {
          key: '/analysis/standards-config',
          title: '评价标准配置',
          icon: 'el-icon-setting'
        }
      ]
    }
  },
  computed: {
    currentPageTitle() {
      const routeMap = {
        '/analysis/comprehensive': '综合评价分析',
        '/analysis/standards': '评价标准查看',
        '/analysis/standards-config': '评价标准配置',
      }
      return routeMap[this.$route.path] || '综合评价分析'
    },
    currentPageDesc() {
      const descMap = {
        '/analysis/comprehensive': '进行综合水质评价分析',
        '/analysis/standards': '查看水质评价标准',
        '/analysis/standards-config': '配置水质评价标准',
      }
      return descMap[this.$route.path] || '综合评价分析'
    }
  }
}
</script>
