<template>
  <div class="user-area">
    <a-spin v-if="loginUserStore.loading" size="small" aria-label="正在获取登录状态" />
    <a-dropdown v-else-if="loginUserStore.loginUser.id" :trigger="['click']">
      <a-button type="text" class="user-menu" aria-label="用户菜单" :loading="loggingOut">
        <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="32">{{
          userName.slice(0, 1)
        }}</a-avatar>
        <span class="user-name">{{ userName }}</span>
      </a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item key="logout" :disabled="loggingOut" @click="handleLogout"
            >退出登录</a-menu-item
          >
        </a-menu>
      </template>
    </a-dropdown>
    <RouterLink v-else v-slot="{ href, navigate }" :to="loginTarget" custom>
      <a-button type="primary" :href="href" @click="navigate">登录</a-button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { userLogout } from '@/api/userController'
import { getSafeRedirect, isAuthPage } from '@/router/authRedirect'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()
const loggingOut = ref(false)
const userName = computed(
  () => loginUserStore.loginUser.userName || loginUserStore.loginUser.userAccount || '用户',
)
const loginTarget = computed(() => ({
  path: '/user/login',
  query: {
    redirect:
      getSafeRedirect(isAuthPage(route.path) ? route.query.redirect : route.fullPath) ?? '/',
  },
}))

async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    const { data } = await userLogout()
    if ((data.code === 0 && data.data === true) || data.code === 40100) {
      loginUserStore.resetLoginUser()
      message.success('已退出登录')
      await router.replace('/')
    } else {
      message.error(data.message || '退出登录失败，请稍后重试')
    }
  } catch {
    message.error('退出登录失败，请检查网络后重试')
  } finally {
    loggingOut.value = false
  }
}
</script>

<style scoped>
.user-area {
  flex-shrink: 0;
}
.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: auto;
  padding: 4px 8px;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
