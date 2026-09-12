export const ADMIN_HOME = '/admin/userManage'

export function isAdmin(user: API.LoginUserVO) {
  return Boolean(user.id) && user.userRole === 'admin'
}

export function getUserHome(user: API.LoginUserVO) {
  return isAdmin(user) ? ADMIN_HOME : '/'
}
