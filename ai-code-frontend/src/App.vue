<template>
  <a-config-provider :locale="zhCN">
    <div v-if="loginUserStore.loading" class="app-loading" role="status">
      <a-spin tip="正在加载账号信息…" />
    </div>
    <RouterView v-else />
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { RouterView } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'

const loginUserStore = useLoginUserStore()
void loginUserStore.fetchLoginUser()
</script>

<style>
.app-loading {
  display: grid;
  min-height: 100dvh;
  place-items: center;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  min-width: 320px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>
