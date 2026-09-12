import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'
import HomePage from '@/pages/HomePage.vue'
import { ADMIN_HOME } from '@/access'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      { path: '', name: '主页', component: HomePage },
      {
        path: 'user/login',
        name: '用户登录',
        component: () => import('@/pages/user/UserLoginPage.vue'),
      },
      {
        path: 'user/register',
        name: '用户注册',
        component: () => import('@/pages/user/UserRegisterPage.vue'),
      },
      {
        path: 'forbidden',
        name: '无访问权限',
        component: () => import('@/pages/ForbiddenPage.vue'),
      },
      {
        path: ':pathMatch(.*)*',
        name: '页面不存在',
        component: () => import('@/pages/NotFoundPage.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: ADMIN_HOME },
      {
        path: 'userManage',
        name: '用户管理',
        component: () => import('@/pages/admin/UserManagePage.vue'),
      },
      {
        path: ':pathMatch(.*)*',
        name: '管理页面不存在',
        component: () => import('@/pages/NotFoundPage.vue'),
      },
    ],
  },
]
