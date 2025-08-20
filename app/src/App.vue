<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { apiClient } from '@/services/api'
import AuthModal from '@/components/AuthModal.vue'

const userStore = useUserStore()
const showAuthModal = ref(false)
const authModalMode = ref<'login' | 'register'>('login')
const route = useRoute()
const router = useRouter()

// Initialize CSRF token on app startup
onMounted(async () => {
  await apiClient.initializeCsrf()
})

// Determine if we're in the app (authenticated routes) or on landing pages
const isInApp = computed(() => {
  return route.meta.requiresAuth === true
})

function openAuthModal(mode: 'login' | 'register' = 'login') {
  authModalMode.value = mode
  showAuthModal.value = true
}

function closeAuthModal() {
  showAuthModal.value = false
}

function handleAuthSuccess() {
  showAuthModal.value = false
  // Redirect to dashboard after successful authentication
  router.push({ name: 'home' })
}

function handleLogoClick() {
  if (isInApp.value) {
    // If we're in the app, go to app home
    router.push({ name: 'home' })
  } else {
    // If we're on auth/onboarding page, go to root
    router.push({ name: 'root' })
  }
}
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-container">
        <div class="logo-section" @click="handleLogoClick">
          <span class="app-logo">中</span>
          <div>
            <h1 class="app-title">MandarinPath</h1>
            <p class="app-subtitle">智能中文学习</p>
          </div>
        </div>

        <nav class="main-nav">
          <template v-if="userStore.isLoggedIn">
            <!-- Only show Learning Hub button when not already in the app -->
            <RouterLink v-if="!isInApp" to="/app" class="nav-link">
              <span class="nav-icon">🚀</span>
              <span class="nav-text">Learning Hub</span>
            </RouterLink>
            <RouterLink to="/profile" class="nav-link user-profile-link">
              <span class="nav-icon">👤</span>
              <span class="nav-text">{{
                userStore.currentUser?.display_name ||
                userStore.currentUser?.email?.split('@')[0] ||
                'Profile'
              }}</span>
            </RouterLink>
          </template>
          <template v-else>
            <button @click="openAuthModal('login')" class="nav-link auth-button">
              <span class="nav-icon">🔐</span>
              <span class="nav-text">Sign In</span>
            </button>
            <button @click="openAuthModal('register')" class="nav-link auth-button">
              <span class="nav-icon">✨</span>
              <span class="nav-text">Sign Up</span>
            </button>
          </template>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <AuthModal
      :show="showAuthModal"
      :default-mode="authModalMode"
      @close="closeAuthModal"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: white;
  color: #334155;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  z-index: 100;
}

.header-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo-section:hover {
  opacity: 0.8;
}

.app-logo {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background-color: #dc2626;
  color: white;
  font-weight: bold;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.logo-section:hover .app-logo {
  transform: scale(1.05);
}

.app-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.app-subtitle {
  font-size: 0.75rem;
  margin: 0;
  color: #64748b;
  font-weight: 400;
}

.main-nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  color: #64748b;
  border-radius: 0.75rem;
  min-width: 60px;
  transition: all 0.2s;
}

.auth-button,
.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.auth-button:hover {
  background: #f1f5f9;
  color: #334155;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #334155;
}

.nav-link.router-link-active {
  background: #fef2f2;
  color: #dc2626;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.nav-icon {
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.nav-text {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
}

.user-profile-link {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.user-profile-link:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.user-profile-link .nav-text {
  font-weight: 600;
}

.app-main {
  flex: 1;
  width: 100%;
  background: #f8fafc;
}

/* Tablet */
@media (min-width: 768px) {
  .header-container {
    padding: 1.25rem 2rem;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .app-subtitle {
    font-size: 0.85rem;
  }

  .main-nav {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    min-width: 70px;
  }

  .nav-icon {
    font-size: 1.1rem;
  }

  .nav-text {
    font-size: 0.75rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .header-container {
    padding: 1.5rem 3rem;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
  }

  .main-nav {
    gap: 0.75rem;
  }

  .nav-link {
    padding: 0.6rem 1.25rem;
    min-width: 85px;
  }

  .nav-icon {
    font-size: 1.3rem;
    margin-bottom: 0.3rem;
  }

  .nav-text {
    font-size: 0.8rem;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .header-container {
    padding: 1.5rem 4rem;
  }

  .app-title {
    font-size: 2.2rem;
  }

  .nav-link {
    padding: 0.7rem 1.5rem;
    min-width: 95px;
  }

  .nav-icon {
    font-size: 1.4rem;
  }

  .nav-text {
    font-size: 0.85rem;
  }
}

/* Mobile - stack navigation */
@media (max-width: 480px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .logo-section {
    align-items: center;
    text-align: center;
  }

  .main-nav {
    justify-content: center;
    width: 100%;
  }

  .nav-link {
    flex: 1;
    max-width: 90px;
  }
}
</style>
