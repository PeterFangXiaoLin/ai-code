<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <a-card :bordered="false">
    <a-space direction="vertical" :size="16">
      <a-tag color="blue">AI CODE</a-tag>
      <div>
        <a-typography-title :level="1">让创意在代码中生长</a-typography-title>
        <a-typography-paragraph type="secondary">
          欢迎来到 AI Code，一起探索 AI 与编程的更多可能。
        </a-typography-paragraph>
      </div>
      <RouterLink v-slot="{ href, navigate }" to="/about" custom>
        <a-button type="primary" size="large" :href="href" @click="navigate">了解项目</a-button>
      </RouterLink>
    </a-space>
  </a-card>
</template>
