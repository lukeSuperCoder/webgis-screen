import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import UserManage from '../views/user/UserManage.vue'

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
        component: () => import('../views/Analysis.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'data',
        name: 'DataManage',
        component: () => import('../views/DataManage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'system',
        name: 'SystemManage',
        component: () => import('../views/SystemManage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'user',
        name: 'UserManage',
        component: UserManage,
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  next()

  // const isLogin = localStorage.getItem('isLogin')
  // if (to.meta.requiresAuth && !isLogin) {
  //   next('/login')
  // } else {
  //   next()
  // }
})

export default router 