<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<template>
  <a-layout class="basic-layout">
    <a-layout-header class="layout-header">
      <GlobalHeader />
    </a-layout-header>

    <a-layout-content class="layout-content">
      <main id="main-content" class="content-container">
        <RouterView />
      </main>
    </a-layout-content>

    <a-layout-footer class="layout-footer">
      <GlobalFooter />
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.basic-layout {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #f5f7fa;
}

.layout-header {
  z-index: 1;
  flex: 0 0 auto;
  height: auto;
  padding: 0 32px;
  line-height: normal;
  background: #fff;
  border-bottom: 1px solid #edf0f3;
}

/* 仅内容区滚动，让页脚始终可见，并避免遮挡页面内容。 */
.layout-content {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
}

.content-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  overflow-wrap: anywhere;
}

.layout-footer {
  flex: 0 0 auto;
  padding: 16px 32px;
  background: #fff;
  border-top: 1px solid #edf0f3;
}

@media (max-width: 767px) {
  .layout-header {
    padding: 0 16px;
  }

  .content-container {
    padding: 24px 16px;
  }

  .layout-footer {
    padding: 12px 16px;
  }
}
</style>
