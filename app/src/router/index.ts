import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/loading',
      name: 'loading',
      component: () => import('../views/LoadingView.vue'),
    },
    {
      path: '/tasks/speaking',
      name: 'speaking-task',
      component: () => import('../views/SpeakingTaskView.vue'),
    },
    {
      path: '/tasks/reading',
      name: 'reading-task',
      component: () => import('../views/ReadingTaskView.vue'),
    },
    {
      path: '/tasks/drawing',
      name: 'drawing-task',
      component: () => import('../views/DrawingTaskView.vue'),
    },
  ],
})

export default router
