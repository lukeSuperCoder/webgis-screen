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
        },
        {
          key: '/system/site-management',
          title: '站点信息管理',
          icon: 'el-icon-location'
        },
        {
          key: '/system/project-management',
          title: '监测项目配置',
          icon: 'el-icon-setting'
        }
      ]
    }
  },
  computed: {
    currentPageTitle() {
      const routeMap = {
        '/system/user-management': '用户管理',
        '/system/site-management': '站点信息管理',
        '/system/project-management': '监测项目配置'
      }
      return routeMap[this.$route.path] || '系统管理'
    },
    currentPageDesc() {
      const descMap = {
        '/system/user-management': '管理系统用户账号和权限',
        '/system/site-management': '管理监测站点基础信息',
        '/system/project-management': '配置监测项目参数'
      }
      return descMap[this.$route.path] || '系统管理功能'
    }
  }
}
</script>
