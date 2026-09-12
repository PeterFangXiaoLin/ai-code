<template>
  <a-layout v-if="isAdmin(store.loginUser)" class="admin-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      class="admin-sidebar"
      :width="224"
      breakpoint="lg"
      :collapsed-width="0"
      :trigger="null"
    >
      <RouterLink :to="ADMIN_HOME" class="admin-brand" aria-label="AI Code 管理控制台">
        <img :src="logo" alt="" width="36" height="36" />
        <span>AI Code<small>管理控制台</small></span>
      </RouterLink>
      <div class="nav-caption">平台管理</div>
      <nav aria-label="管理导航">
        <a-menu theme="dark" mode="inline" :selected-keys="[route.path]" class="admin-menu">
          <a-menu-item v-for="item in items" :key="item.path"
            ><RouterLink :to="item.path">{{ item.label }}</RouterLink></a-menu-item
          >
        </a-menu>
      </nav>
      <div class="sidebar-foot">AI Code <span>ADMIN WORKSPACE</span></div>
    </a-layout-sider>
    <a-layout class="admin-main">
      <a-layout-header class="admin-header">
        <div class="header-location">
          <a-button
            type="text"
            :aria-expanded="!collapsed"
            aria-label="切换管理导航"
            @click="collapsed = !collapsed"
            >☰</a-button
          >
          <a-breadcrumb
            ><a-breadcrumb-item>管理控制台</a-breadcrumb-item
            ><a-breadcrumb-item>{{ route.name }}</a-breadcrumb-item></a-breadcrumb
          >
        </div>
        <UserAccountMenu />
      </a-layout-header>
      <a-layout-content class="admin-content">
        <main id="admin-main-content"><RouterView /></main>
        <footer class="admin-footer">AI Code · 管理工作区</footer>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ADMIN_HOME, isAdmin } from '@/access'
import { getVisibleNavigation } from '@/config/menu'
import { useLoginUserStore } from '@/stores/loginUser'
import UserAccountMenu from '@/components/UserAccountMenu.vue'
import logo from '@/assets/logo.png'

const route = useRoute()
const store = useLoginUserStore()
const collapsed = ref(false)
const items = computed(() => getVisibleNavigation(store.loginUser))
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #f5f7fb;
}
.admin-sidebar {
  background: #111c32;
  overflow: hidden;
}
.admin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 28px 24px 42px;
  color: #fff;
  font-size: 21px;
  font-weight: 650;
  white-space: nowrap;
}
.admin-brand img {
  border-radius: 10px;
  background: #fff;
}
.admin-brand small {
  display: block;
  margin-top: 3px;
  color: #a3afc4;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 2px;
}
.nav-caption {
  margin: 0 24px 12px;
  font-size: 12px;
  color: #8f9cb4;
}
.admin-menu {
  padding: 0 12px;
  background: transparent;
}
.admin-menu :deep(.ant-menu-item) {
  margin: 4px 0;
  width: 100%;
}
.admin-menu :deep(.ant-menu-item-selected) {
  background: #285ee8;
}
.sidebar-foot {
  position: absolute;
  bottom: 24px;
  left: 24px;
  color: #a3afc4;
  font-size: 12px;
  white-space: nowrap;
}
.sidebar-foot span {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  letter-spacing: 1.5px;
}
.admin-main {
  min-width: 0;
  background: transparent;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 72px;
  padding: 0 32px;
  background: #fff;
  line-height: normal;
  border-bottom: 1px solid #e9edf4;
}
.header-location {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}
.admin-content {
  overflow: auto;
  padding: 32px;
}
#admin-main-content {
  max-width: 1600px;
  margin: 0 auto;
}
.admin-footer {
  margin-top: 32px;
  color: #8b95a7;
  text-align: center;
  font-size: 12px;
}
@media (max-width: 767px) {
  .admin-header {
    padding: 0 16px;
  }
  .admin-content {
    padding: 24px 16px;
  }
  .header-location {
    gap: 4px;
  }
  .header-location :deep(.ant-breadcrumb li:first-child) {
    display: none;
  }
  .admin-sidebar {
    position: fixed;
    inset: 72px auto 0 0;
    z-index: 10;
  }
}
</style>
