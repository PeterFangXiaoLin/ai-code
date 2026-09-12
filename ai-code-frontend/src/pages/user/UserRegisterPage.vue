<template>
  <div id="userRegisterPage">
    <a-card class="auth-card" :bordered="false">
      <a-typography-title :level="2">创建账号</a-typography-title>
      <a-typography-paragraph type="secondary"
        >加入 AI Code，开启你的创作之旅。</a-typography-paragraph
      >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item label="账号" name="userAccount">
          <a-input
            v-model:value="formState.userAccount"
            placeholder="4–32 位账号"
            autocomplete="username"
            :maxlength="32"
            size="large"
          />
        </a-form-item>
        <a-form-item label="密码" name="userPassword">
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="8–32 位密码"
            autocomplete="new-password"
            :maxlength="32"
            size="large"
          />
        </a-form-item>
        <a-form-item label="确认密码" name="checkPassword">
          <a-input-password
            v-model:value="formState.checkPassword"
            placeholder="请再次输入密码"
            autocomplete="new-password"
            :maxlength="32"
            size="large"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="submitting"
            >注册</a-button
          >
        </a-form-item>
      </a-form>
      <div class="auth-footer">
        已有账号？<RouterLink :to="{ path: '/user/login', query: { redirect } }"
          >立即登录</RouterLink
        >
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { userRegister } from '@/api/userController'
import { getSafeRedirect } from '@/router/authRedirect'

const route = useRoute()
const router = useRouter()
const submitting = ref(false)
const formRef = ref<FormInstance>()
const redirect = computed(() => getSafeRedirect(route.query.redirect) ?? '/')
const formState = reactive({ userAccount: '', userPassword: '', checkPassword: '' })
const rules: Record<string, Rule[]> = {
  userAccount: [
    { required: true, whitespace: true, message: '请输入账号' },
    { min: 4, max: 32, message: '账号长度为 4–32 位', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, whitespace: true, message: '请输入密码' },
    { min: 8, max: 32, message: '密码长度为 8–32 位', trigger: 'blur' },
  ],
  checkPassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: async (_rule, value: string) => {
        if (value && value !== formState.userPassword) throw new Error('两次输入的密码不一致')
      },
      trigger: 'blur',
    },
  ],
}

watch(
  () => formState.userPassword,
  () => {
    if (formState.checkPassword) {
      // 修改密码时同步刷新确认密码的校验提示，错误由表单展示。
      void formRef.value?.validateFields(['checkPassword']).catch(() => undefined)
    }
  },
)

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const { data } = await userRegister({ ...formState })
    if (data.code !== 0 || data.data == null) {
      message.error(data.message || '注册失败，请稍后重试')
      return
    }
    formState.userPassword = ''
    formState.checkPassword = ''
    message.success('注册成功，请登录')
    await router.replace({ path: '/user/login', query: { redirect: redirect.value } })
  } catch {
    message.error('注册失败，请检查网络后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped src="./auth.css"></style>
