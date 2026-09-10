<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import logo from '@/assets/logo.png'
import { navigationItems, type NavigationItem } from '@/config/menu'

const props = withDefaults(defineProps<{ items?: NavigationItem[] }>(), {
  items: () => navigationItems,
})

const route = useRoute()

// 优先匹配最长路径，子页面仍高亮所属菜单；根路径只匹配首页。
const selectedKeys = computed(() => {
  const activeItem = [...props.items]
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (item) =>
        route.path === item.path || (item.path !== '/' && route.path.startsWith(`${item.path}/`)),
    )

  return activeItem ? [activeItem.key] : []
})

function handleLogin() {
  message.info('登录功能即将上线，敬请期待')
}
</script>

<template>
  <div class="global-header">
    <RouterLink class="brand" to="/" aria-label="AI Code 首页">
      <img class="brand-logo" :src="logo" alt="" width="40" height="40" />
      <span class="brand-title">AI Code</span>
    </RouterLink>

    <nav class="navigation" aria-label="主导航">
      <a-menu class="navigation-menu" mode="horizontal" :selected-keys="selectedKeys">
        <a-menu-item v-for="item in items" :key="item.key">
          <RouterLink :to="item.path">{{ item.label }}</RouterLink>
        </a-menu-item>
      </a-menu>
    </nav>

    <div class="user-area">
      <a-button type="primary" @click="handleLogin">登录</a-button>
    </div>
  </div>
</template>

<style scoped>
.global-header {
  display: flex;
  align-items: center;
  gap: 32px;
  max-width: 1440px;
  min-height: 72px;
  margin: 0 auto;
}

.brand {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  color: #17233d;
  text-decoration: none;
}

.brand-logo {
  display: block;
  object-fit: contain;
}

.brand-title {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.navigation {
  flex: 1;
  min-width: 0;
}

.navigation-menu {
  line-height: 71px;
  border-bottom: 0;
}

.user-area {
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .global-header {
    flex-wrap: wrap;
    gap: 0 16px;
    padding-top: 12px;
  }

  .brand-title {
    font-size: 19px;
  }

  .navigation {
    order: 3;
    flex-basis: 100%;
  }

  .navigation-menu {
    line-height: 48px;
  }

  .user-area {
    margin-left: auto;
  }
}
</style>
