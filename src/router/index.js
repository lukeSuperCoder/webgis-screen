import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
    redirect: '/monitor',
    children: [
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('../views/Monitor.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('../views/analysis/index.vue'),
        meta: { requiresAuth: true },
        redirect: '/analysis/standards',
        children: [
          {
            path: 'standards',
            name: 'AnalysisStandards',
            component: () => import('../views/analysis/standards.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'standards-config',
            name: 'AnalysisStandardsConfig',
            component: () => import('../views/analysis/standards-config.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'comprehensive',
            name: 'AnalysisComprehensive',
            component: () => import('../views/analysis/comprehensive.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'single-site-multi-factor',
            name: 'AnalysisSingleSiteMultiFactor',
            component: () => import('../views/analysis/single-site-multi-factor.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'single-site-comparison',
            name: 'AnalysisSingleSiteComparison',
            component: () => import('../views/analysis/single-site-comparison.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'multi-site-single-factor',
            name: 'AnalysisMultiSiteSingleFactor',
            component: () => import('../views/analysis/multi-site-single-factor.vue'),
            meta: { requiresAuth: true }
          }
        ]
      },
      {
        path: 'data',
        name: 'DataManage',
        component: () => import('../views/data-manage/index.vue'),
        meta: { requiresAuth: true },
        redirect: '/data/quality-rules',
        children: [
          {
            path: 'quality-rules',
            name: 'DataQualityRules',
            component: () => import('../views/data-manage/quality-rules.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'well-management',
            name: 'DataWellManagement',
            component: () => import('../views/data-manage/well-management.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'monitoring-data',
            name: 'DataMonitoringData',
            component: () => import('../views/data-manage/monitoring-data.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'project-config',
            name: 'DataProjectConfig',
            component: () => import('../views/data-manage/project-config.vue'),
            meta: { requiresAuth: true }
          }
        ]
      },
      {
        path: 'system',
        name: 'SystemManage',
        component: () => import('../views/system-manage/index.vue'),
        meta: { requiresAuth: true },
        redirect: '/system/user-management',
        children: [
          {
            path: 'user-management',
            name: 'SystemUserManagement',
            component: () => import('../views/system-manage/user-management.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'site-management',
            name: 'SystemSiteManagement',
            component: () => import('../views/system-manage/site-management.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'project-management',
            name: 'SystemProjectManagement',
            component: () => import('../views/system-manage/project-management.vue'),
            meta: { requiresAuth: true }
          }
        ]
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLogin = localStorage.getItem('isLogin')
  if (to.meta.requiresAuth && !isLogin) {
    next('/login')
  } else {
    next()
  }
})

export default router 