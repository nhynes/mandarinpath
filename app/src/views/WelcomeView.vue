<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <div class="hero-section">
        <h1 class="hero-title">Welcome to MandarinPath</h1>
        <h2 class="hero-subtitle">智能中文学习</h2>
        <p class="hero-description">
          Your AI-powered Chinese language tutor that makes learning both fun and productive. Focus
          on real-world skills with personalized speaking, reading, and writing practice.
        </p>
      </div>

      <div class="features-section">
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🗣️</div>
            <h3>Speaking Practice</h3>
            <p>AI-powered pronunciation training with instant feedback</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📖</div>
            <h3>Reading Comprehension</h3>
            <p>Graded stories and articles to build your vocabulary</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✍️</div>
            <h3>Character Writing</h3>
            <p>Learn stroke order and character recognition</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <h3>Smart Learning</h3>
            <p>Adaptive difficulty based on your performance</p>
          </div>
        </div>
      </div>

      <div class="auth-section">
        <!-- Authenticated user content -->
        <div v-if="isAuthenticated" class="auth-card">
          <h3>Welcome back! 🎉</h3>
          <p>Ready to continue your Chinese learning journey?</p>

          <div class="auth-buttons">
            <button @click="goToApp" class="auth-btn primary">
              <span class="auth-btn-icon">🚀</span>
              Launch Learning Hub
            </button>
            <button @click="goToProfile" class="auth-btn secondary">
              <span class="auth-btn-icon">👤</span>
              View Profile
            </button>
          </div>
        </div>

        <!-- Non-authenticated user content -->
        <div v-else class="auth-card">
          <h3>Get Started Today</h3>
          <p>Create your account and start learning Chinese! 🇨🇳</p>

          <div class="auth-buttons">
            <button @click="openAuthModal('register')" class="auth-btn primary">
              <span class="auth-btn-icon">✨</span>
              Create Account
            </button>
            <button @click="openAuthModal('login')" class="auth-btn secondary">
              <span class="auth-btn-icon">🔐</span>
              Sign In
            </button>
          </div>

          <div class="passkey-info">
            <details>
              <summary>What are passkeys?</summary>
              <div class="passkey-explanation">
                <p>Passkeys are a secure, password-free way to sign in using:</p>
                <ul>
                  <li>🔒 Biometrics (fingerprint, face, etc.)</li>
                  <li>📱 Your device's security (PIN, pattern)</li>
                  <li>🔑 Hardware security keys</li>
                </ul>
                <p>They're more secure than passwords and sync across your devices!</p>
              </div>
            </details>
          </div>
        </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthModal from '@/components/AuthModal.vue'
import { authService } from '@/services/auth'

const router = useRouter()

const showAuthModal = ref(false)
const authModalMode = ref<'login' | 'register'>('login')
const isAuthenticated = computed(() => authService.isAuthenticated())

function openAuthModal(mode: 'login' | 'register') {
  authModalMode.value = mode
  showAuthModal.value = true
}

function closeAuthModal() {
  showAuthModal.value = false
}

function handleAuthSuccess() {
  showAuthModal.value = false
  router.push({ name: 'home' })
}

function goToApp() {
  router.push({ name: 'home' })
}

function goToProfile() {
  router.push({ name: 'profile' })
}
</script>

<style scoped>
.welcome-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow-y: auto;
}

.welcome-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero-section {
  text-align: center;
  padding: 2rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  opacity: 0.9;
  font-weight: 300;
}

.hero-description {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.9;
}

.features-section {
  padding: 2rem 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.feature-card p {
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.auth-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.auth-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 400px;
  width: 100%;
}

.auth-card h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.auth-card > p {
  margin: 0 0 1.5rem;
  opacity: 0.9;
}

.browser-warning {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.browser-warning p {
  margin: 0.25rem 0;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.auth-btn.primary {
  background: #3b82f6;
  color: white;
}

.auth-btn.primary:hover {
  background: #2563eb;
}

.auth-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.auth-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.auth-btn-icon {
  font-size: 1.1rem;
}

.passkey-info {
  margin-top: 1.5rem;
  text-align: left;
}

.passkey-info details {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.passkey-info summary {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.passkey-explanation {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.5;
}

.passkey-explanation ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.passkey-explanation li {
  margin: 0.25rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .welcome-content {
    padding: 1rem;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feature-card {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }

  .auth-buttons {
    gap: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .welcome-content {
    padding: 3rem 2rem;
    gap: 4rem;
  }

  .hero-title {
    font-size: 4rem;
  }

  .hero-subtitle {
    font-size: 1.75rem;
  }

  .feature-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
