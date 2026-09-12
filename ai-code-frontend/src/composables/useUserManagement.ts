import { onScopeDispose, reactive, ref } from 'vue'
import { addUser, deleteUser, listUserVoByPage, updateUser } from '@/api/userController'

export type UserEditor = Required<
  Pick<API.UserAddRequest, 'userAccount' | 'userName' | 'userAvatar' | 'userProfile' | 'userRole'>
>

export function useUserManagement() {
  const records = ref<API.UserVO[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')
  const saving = ref(false)
  const deletingId = ref<number>()
  const query = reactive<API.UserQueryRequest>({
    pageNum: 1,
    pageSize: 10,
    sortField: 'createTime',
    sortOrder: 'descend',
  })
  let sequence = 0
  let activeRequest: AbortController | undefined

  async function loadUsers(next: Partial<API.UserQueryRequest> = {}) {
    Object.assign(query, next)
    const version = ++sequence
    activeRequest?.abort()
    activeRequest = new AbortController()
    loading.value = true
    error.value = ''
    try {
      const { data } = await listUserVoByPage({ ...query }, { signal: activeRequest.signal })
      if (version !== sequence) return
      if (data.code !== 0 || !data.data) throw new Error(data.message || '用户列表加载失败')
      records.value = data.data.records ?? []
      total.value = data.data.totalRow ?? 0
      const lastPage = Math.max(1, Math.ceil(total.value / (query.pageSize ?? 10)))
      if ((query.pageNum ?? 1) > lastPage) await loadUsers({ pageNum: lastPage })
    } catch (reason) {
      if (version !== sequence) return
      records.value = []
      total.value = 0
      error.value = reason instanceof Error ? reason.message : '用户列表加载失败，请稍后重试'
    } finally {
      if (version === sequence) loading.value = false
    }
  }

  async function saveUser(values: UserEditor, currentUser: API.LoginUserVO, id?: number) {
    if (saving.value) return false
    if (!['user', 'admin'].includes(values.userRole)) throw new Error('请选择有效的用户角色')
    if (id !== undefined && id === currentUser.id && values.userRole !== 'admin')
      throw new Error('不能修改当前登录账号的管理员角色')
    saving.value = true
    try {
      const profile = {
        userName: values.userName.trim(),
        userAvatar: values.userAvatar.trim(),
        userProfile: values.userProfile.trim(),
        userRole: values.userRole,
      }
      // 编辑接口不支持修改账号，明确排除该字段。
      const { data } =
        id === undefined
          ? await addUser({ ...profile, userAccount: values.userAccount.trim() })
          : await updateUser({ ...profile, id })
      if (data.code !== 0 || (id === undefined ? data.data == null : data.data !== true))
        throw new Error(data.message || '保存失败，请重试')
      await loadUsers(id === undefined ? { pageNum: 1 } : {})
      return true
    } finally {
      saving.value = false
    }
  }

  async function removeUser(id: number, currentUser: API.LoginUserVO) {
    if (deletingId.value !== undefined) return false
    if (id === currentUser.id) throw new Error('不能删除当前登录账号')
    deletingId.value = id
    try {
      const { data } = await deleteUser({ id })
      if (data.code !== 0 || data.data !== true) throw new Error(data.message || '删除失败，请重试')
      await loadUsers()
      return true
    } finally {
      deletingId.value = undefined
    }
  }

  onScopeDispose(() => {
    sequence++
    activeRequest?.abort()
  })
  return {
    records,
    total,
    loading,
    error,
    saving,
    deletingId,
    query,
    loadUsers,
    saveUser,
    removeUser,
  }
}
