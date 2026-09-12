<template>
  <div id="forbiddenPage">
    <a-result
      status="403"
      title="暂无访问权限"
      sub-title="此页面仅对管理员开放，你可以返回首页继续使用。"
    >
      <template #extra
        ><RouterLink to="/"><a-button type="primary">返回首页</a-button></RouterLink></template
      >
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
