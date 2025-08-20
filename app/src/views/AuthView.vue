<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-header">
        <div class="logo-section">
          <span class="app-logo">中</span>
          <div>
            <h1 class="app-title">MandarinPath</h1>
            <p class="app-subtitle">智能中文学习</p>
          </div>
        </div>
        <h2 class="welcome-message">You're all set! Create an account or sign in to start learning.</h2>
      </div>

      <div class="auth-actions">
        <button @click="openAuthModal('register')" class="auth-btn primary">
          <span class="auth-btn-icon">✨</span>
          Create Account
        </button>
        <button @click="openAuthModal('login')" class="auth-btn secondary">
          <span class="auth-btn-icon">🔐</span>
          Sign In
        </button>
      </div>
    </div>

    <AuthModal
      :show="showAuthModal"
      :default-mode="authModalMode"
      @close="closeAuthModal"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthModal from '@/components/AuthModal.vue'

const router = useRouter()

const showAuthModal = ref(false)
const authModalMode = ref<'login' | 'register'>('login')

function openAuthModal(mode: 'login' | 'register') {
  authModalMode.value = mode
  showAuthModal.value = true
}

function closeAuthModal() {
  showAuthModal.value = false
}

function handleAuthSuccess() {
  showAuthModal.value = false
  // After successful authentication, go to dashboard
  router.push({ name: 'home' })
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-content {
  background: white;
  border-radius: 1.5rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.auth-header {
  margin-bottom: 2rem;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.app-logo {
  display: inline-flex;
  height: 3rem;
  width: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background-color: #dc2626;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.app-subtitle {
  font-size: 1rem;
  margin: 0;
  color: #64748b;
  font-weight: 400;
}

.welcome-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.auth-btn.primary {
  background: #dc2626;
  color: white;
}

.auth-btn.primary:hover {
  background: #b91c1c;
}

.auth-btn.secondary {
  background: white;
  color: #374151;
  border: 2px solid #e2e8f0;
}

.auth-btn.secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.auth-btn-icon {
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 640px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-content {
    padding: 2rem;
  }

  .logo-section {
    flex-direction: column;
    gap: 0.75rem;
  }

  .app-logo {
    height: 2.5rem;
    width: 2.5rem;
    font-size: 1.25rem;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .welcome-message {
    font-size: 1.125rem;
  }

  .auth-actions {
    gap: 0.75rem;
  }
}

@media (min-width: 768px) {
  .auth-actions {
    flex-direction: row;
  }
}
</style>