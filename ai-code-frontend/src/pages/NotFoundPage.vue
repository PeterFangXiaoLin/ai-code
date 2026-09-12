<template>
  <div id="notFoundPage">
    <a-result status="404" title="页面不存在" sub-title="请检查地址，或返回你的工作区。">
      <template #extra
        ><RouterLink :to="getUserHome(store.loginUser)"
          ><a-button type="primary">返回工作区</a-button></RouterLink
        ></template
      >
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getUserHome } from '@/access'
import { useLoginUserStore } from '@/stores/loginUser'
const store = useLoginUserStore()
</script>
