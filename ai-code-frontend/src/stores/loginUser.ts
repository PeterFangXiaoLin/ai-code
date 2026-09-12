import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUser } from '@/api/userController.ts'

/**
 * 全局登录用户信息
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  // 默认值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })
  const loading = ref(true)
  let initialRequest: Promise<void> | undefined
  let userVersion = 0

  // 每次进入网站只初始化一次，避免迟到的响应覆盖登录或退出后的状态。
  function fetchLoginUser() {
    if (initialRequest) return initialRequest
    const version = userVersion
    initialRequest = (async () => {
      try {
        const res = await getLoginUser()
        if (version === userVersion) {
          loginUser.value =
            res.data.code === 0 && res.data.data ? res.data.data : { userName: '未登录' }
        }
      } catch {
        if (version === userVersion) loginUser.value = { userName: '未登录' }
      } finally {
        loading.value = false
      }
    })()
    return initialRequest
  }

  // 更新当前登录的用户信息
  function setLoginUser(newLoginUser: API.LoginUserVO) {
    userVersion += 1
    loginUser.value = newLoginUser
    loading.value = false
  }

  function resetLoginUser() {
    setLoginUser({ userName: '未登录' })
  }

  return { loginUser, loading, fetchLoginUser, setLoginUser, resetLoginUser }
})
