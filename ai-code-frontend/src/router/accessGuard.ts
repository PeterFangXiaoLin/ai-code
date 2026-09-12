import type { NavigationGuard } from 'vue-router'
import { ADMIN_HOME, isAdmin } from '@/access'
import { getAuthRedirect, isAuthPage } from './authRedirect'

type LoginStore = {
  loginUser: API.LoginUserVO
  fetchLoginUser: () => Promise<void>
}

export function createAccessGuard(getStore: () => LoginStore): NavigationGuard {
  return async (to, from) => {
    const store = getStore()
    await store.fetchLoginUser()
    const user = store.loginUser
    // 元信息保护管理布局的所有子路由，前缀检查也覆盖未注册的管理地址。
    const adminOnly = to.meta.requiresAdmin || /^\/admin(?:\/|$)/i.test(to.path)
    if (adminOnly && !user.id) {
      return { path: '/user/login', query: { redirect: to.fullPath }, replace: true }
    }
    if (adminOnly && !isAdmin(user)) return { path: '/forbidden', replace: true }
    // 管理员使用独立工作区；未来新增的普通页面也遵循相同策略。
    if (isAdmin(user) && !adminOnly) return { path: ADMIN_HOME, replace: true }
    if (isAuthPage(to.path)) {
      const redirect = getAuthRedirect(to, from)
      if (to.query.redirect !== redirect) {
        return { path: to.path, query: { ...to.query, redirect }, hash: to.hash, replace: true }
      }
    }
  }
}
