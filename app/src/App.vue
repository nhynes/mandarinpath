<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { apiClient } from '@/services/api'
import AuthModal from '@/components/AuthModal.vue'

const userStore = useUserStore()
const showAuthModal = ref(false)
const authModalMode = ref<'login' | 'register'>('login')

// Initialize CSRF token on app startup
onMounted(async () => {
  await apiClient.initializeCsrf()
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
  // Could show a success toast here
}
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-container">
        <div class="logo-section">
          <h1 class="app-title">MandarinPath</h1>
          <p class="app-subtitle">智能中文学习</p>
        </div>

        <nav class="main-nav">
          <template v-if="userStore.isLoggedIn">
            <RouterLink to="/" class="nav-link">
              <span class="nav-icon">🏠</span>
              <span class="nav-text">Home</span>
            </RouterLink>
            <RouterLink to="/loading" class="nav-link">
              <span class="nav-icon">📚</span>
              <span class="nav-text">Load Words</span>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  flex-direction: column;
  align-items: flex-start;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 0.8rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.main-nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 0.75rem;
  text-decoration: none;
  color: white;
  border-radius: 6px;
  min-width: 60px;
}

.auth-button,
.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
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
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-profile-link:hover {
  background: rgba(255, 255, 255, 0.25);
}

.user-profile-link .nav-text {
  font-weight: 600;
}

.app-main {
  flex: 1;
  width: 100%;
  background: #f7fafc;
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
