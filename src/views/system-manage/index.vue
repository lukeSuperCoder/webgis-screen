<template>
  <PageLayout
    title="系统管理"
    :menu-items="menuItems"
    :current-page-title="currentPageTitle"
    :current-page-desc="currentPageDesc"
  />
</template>

<script>
import PageLayout from '@/components/PageLayout.vue'

export default {
  name: 'SystemManage',
  components: {
    PageLayout
  },
  data() {
    return {
      menuItems: [
        {
          key: '/system/user-management',
          title: '用户管理',
          icon: 'el-icon-user'
        }
      ]
    }
  },
  computed: {
    currentPageTitle() {
      const routeMap = {
        '/system/user-management': '用户管理'
      }
      return routeMap[this.$route.path] || '用户管理'
    },
    currentPageDesc() {
      const descMap = {
        '/system/user-management': '管理系统用户账号和权限',
      }
      return descMap[this.$route.path] || '用户管理'
    }
  }
}
</script>
