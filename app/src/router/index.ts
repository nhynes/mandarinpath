import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('../views/WelcomeView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/app',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/loading',
      name: 'loading',
      component: () => import('../views/LoadingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/speaking',
      name: 'speaking-task',
      component: () => import('../views/SpeakingTaskView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/reading',
      name: 'reading-task',
      component: () => import('../views/ReadingTaskView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/drawing',
      name: 'drawing-task',
      component: () => import('../views/DrawingTaskView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth !== false // Default to requiring auth
  const isAuthenticated = authService.isAuthenticated()

  if (requiresAuth && !isAuthenticated) {
    // Try to refresh token if we have one
    const refreshed = await authService.refreshAccessToken()

    if (!refreshed) {
      // Redirect to welcome page if not authenticated
      next({ name: 'welcome' })
      return
    }
  }

  next()
})

export default router
