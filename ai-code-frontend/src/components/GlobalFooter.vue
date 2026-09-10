<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="global-footer">
    <span>© {{ currentYear }} AI Code · 让创意在代码中生长</span>
    <a href="https://github.com/PeterFangXiaoLin/ai-code" target="_blank" rel="noopener noreferrer">
      GitHub 开源仓库 ↗
    </a>
  </div>
</template>

<style scoped>
.global-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 20px;
  color: #667085;
  font-size: 13px;
  line-height: 22px;
  text-align: center;
}

.global-footer a {
  white-space: nowrap;
}
</style>
