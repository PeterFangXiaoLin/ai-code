<template>
  <div id="userLoginPage">
    <a-card class="auth-card" :bordered="false">
      <a-typography-title :level="2">欢迎登录</a-typography-title>
      <a-typography-paragraph type="secondary">登录 AI Code，继续你的创作。</a-typography-paragraph>
      <a-form :model="formState" :rules="rules" layout="vertical" @finish="handleSubmit">
        <a-form-item label="账号" name="userAccount">
          <a-input
            v-model:value="formState.userAccount"
            placeholder="请输入账号"
            autocomplete="username"
            :maxlength="32"
            size="large"
          />
        </a-form-item>
        <a-form-item label="密码" name="userPassword">
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            autocomplete="current-password"
            :maxlength="32"
            size="large"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="submitting"
            >登录</a-button
          >
        </a-form-item>
      </a-form>
      <div class="auth-footer">
        还没有账号？<RouterLink :to="{ path: '/user/register', query: { redirect } }"
          >立即注册</RouterLink
        >
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { userLogin } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'
import { getSafeRedirect } from '@/router/authRedirect'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()
const submitting = ref(false)
const redirect = computed(() => getSafeRedirect(route.query.redirect) ?? '/')
const formState = reactive({ userAccount: '', userPassword: '' })
const rules: Record<string, Rule[]> = {
  userAccount: [
    { required: true, whitespace: true, message: '请输入账号' },
    { min: 4, max: 32, message: '账号长度为 4–32 位', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, whitespace: true, message: '请输入密码' },
    { min: 8, max: 32, message: '密码长度为 8–32 位', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const { data } = await userLogin({ ...formState })
    if (data.code !== 0 || !data.data?.id) {
      message.error(data.message || '登录失败，请检查账号和密码')
      return
    }
    loginUserStore.setLoginUser(data.data)
    formState.userPassword = ''
    message.success('登录成功')
    await router.replace(redirect.value)
  } catch {
    message.error('登录失败，请检查网络后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped src="./auth.css"></style>
