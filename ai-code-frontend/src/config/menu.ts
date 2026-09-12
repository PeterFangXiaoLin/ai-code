import { isAdmin } from '@/access'

export interface NavigationItem {
  key: string
  label: string
  path: string
  audience: 'public' | 'admin'
}

// 添加菜单时，请确保 path 对应 src/router/index.ts 中已注册的路由。
export const navigationItems: NavigationItem[] = [
  { key: 'home', label: '首页', path: '/', audience: 'public' },
  { key: 'userManage', label: '用户管理', path: '/admin/userManage', audience: 'admin' },
]

export function getVisibleNavigation(user: API.LoginUserVO, items = navigationItems) {
  return items.filter((item) => item.audience === (isAdmin(user) ? 'admin' : 'public'))
}
