type AuthRoute = {
  path: string
  fullPath: string
  query: Record<string, unknown>
}

export function isAuthPage(path: string) {
  return /^\/user\/(login|register)\/?$/i.test(path)
}

function hasUnsafeCharacters(value: string) {
  return [...value].some((character) => character === '\\' || character.charCodeAt(0) <= 32)
}

// 仅允许站内路径，并排除认证页面，避免开放重定向和登录后循环跳转。
export function getSafeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return
  if (hasUnsafeCharacters(value)) return

  try {
    const url = new URL(value, 'https://auth.local')
    const path = decodeURIComponent(url.pathname)
    if (url.origin !== 'https://auth.local' || path.startsWith('//') || hasUnsafeCharacters(path))
      return
    if (isAuthPage(path)) return
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return
  }
}

export function getAuthRedirect(to: AuthRoute, from: AuthRoute) {
  return (
    getSafeRedirect(to.query.redirect) ??
    getSafeRedirect(isAuthPage(from.path) ? from.query.redirect : from.fullPath) ??
    '/'
  )
}
