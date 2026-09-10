export interface NavigationItem {
  key: string
  label: string
  path: string
}

// 添加菜单时，请确保 path 对应 src/router/index.ts 中已注册的路由。
export const navigationItems: NavigationItem[] = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'about', label: '关于项目', path: '/about' },
]
