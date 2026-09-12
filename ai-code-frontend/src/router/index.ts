import { createRouter, createWebHistory } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'
import { createAccessGuard } from './accessGuard'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(createAccessGuard(() => useLoginUserStore()))

export default router
