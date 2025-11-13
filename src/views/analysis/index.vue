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
        }
      ]
    }
  },
  computed: {
    currentPageTitle() {
      const routeMap = {
        '/analysis/comprehensive': '综合评价分析',
      }
      return routeMap[this.$route.path] || '评价分析'
    },
    currentPageDesc() {
      const descMap = {
        '/analysis/comprehensive': '进行综合水质评价分析',
      }
      return descMap[this.$route.path] || '水质评价分析功能'
    }
  }
}
</script>
