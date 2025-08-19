<template>
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isRegistering ? 'Create Account' : 'Sign In' }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Registration Form -->
        <form v-if="isRegistering" @submit.prevent="handleRegister" class="auth-form">
          <p class="form-description">Create your account to start learning Chinese! 🇨🇳</p>

          <div class="form-group">
            <label for="registerEmail">Email</label>
            <input
              id="registerEmail"
              v-model="registerForm.email"
              type="email"
              placeholder="your@email.com"
              autocomplete="email"
              required
              :class="{ error: emailError }"
            />
            <small v-if="emailError" class="error-text">{{ emailError }}</small>
          </div>

          <div class="form-group">
            <label for="registerPassword">Password</label>
            <input
              id="registerPassword"
              v-model="registerForm.password"
              type="password"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              required
              :class="{ error: passwordError }"
            />
            <small v-if="passwordError" class="error-text">{{ passwordError }}</small>
            <small v-else>Minimum 8 characters</small>
          </div>

          <div class="form-group">
            <label for="registerDisplayName">Display Name (optional)</label>
            <input
              id="registerDisplayName"
              v-model="registerForm.displayName"
              type="text"
              placeholder="How should we call you?"
              autocomplete="name"
            />
          </div>

          <button type="submit" class="auth-button primary" :disabled="isLoading">
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>

          <p class="switch-mode">
            Already have an account?
            <button type="button" @click="switchToLogin" class="link-button">
              Sign in instead
            </button>
          </p>
        </form>

        <!-- Login Form -->
        <form v-else @submit.prevent="handleLogin" class="auth-form">
          <p class="form-description">Welcome back! Sign in to continue learning. 📚</p>

          <div class="form-group">
            <label for="loginEmail">Email</label>
            <input
              id="loginEmail"
              v-model="loginForm.email"
              type="email"
              placeholder="your@email.com"
              autocomplete="email"
              required
              :class="{ error: emailError }"
            />
            <small v-if="emailError" class="error-text">{{ emailError }}</small>
          </div>

          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input
              id="loginPassword"
              v-model="loginForm.password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
              :class="{ error: passwordError }"
            />
            <small v-if="passwordError" class="error-text">{{ passwordError }}</small>
          </div>

          <button type="submit" class="auth-button primary" :disabled="isLoading">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            @click="switchToRegister"
            class="auth-button secondary"
            :disabled="isLoading"
          >
            Create New Account
          </button>
        </form>

        <!-- Error Display -->
        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="clearError" class="link-button">Dismiss</button>
        </div>

        <!-- Success Display -->
        <div v-if="success" class="success-message">
          <p>{{ success }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'

interface Props {
  show?: boolean
  defaultMode?: 'login' | 'register'
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  defaultMode: 'login',
})

const emit = defineEmits<Emits>()

const userStore = useUserStore()

// Form state
const isRegistering = ref(props.defaultMode === 'register')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Form data
const registerForm = ref({
  email: '',
  password: '',
  displayName: '',
})

const loginForm = ref({
  email: '',
  password: '',
})

// Validation errors
const emailError = ref('')
const passwordError = ref('')

// Computed
const showModal = computed(() => props.show && !userStore.isLoggedIn)

// Validation watchers
watch(() => registerForm.value.email, validateEmail)
watch(() => loginForm.value.email, validateEmail)
watch(() => registerForm.value.password, validatePassword)
watch(() => loginForm.value.password, validatePassword)

// Methods
function validateEmail() {
  const email = isRegistering.value ? registerForm.value.email : loginForm.value.email
  if (email && !userStore.validateEmail(email)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

function validatePassword() {
  const password = isRegistering.value ? registerForm.value.password : loginForm.value.password
  if (password) {
    const validation = userStore.validatePassword(password)
    passwordError.value = validation.valid ? '' : validation.message || ''
  } else {
    passwordError.value = ''
  }
}

async function handleRegister() {
  if (isLoading.value) return

  // Validate form
  validateEmail()
  validatePassword()

  if (emailError.value || passwordError.value) {
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const registered = await userStore.register(
      registerForm.value.email.trim(),
      registerForm.value.password,
      registerForm.value.displayName.trim() || undefined,
    )

    if (registered) {
      success.value = 'Account created and signed in successfully! 🎉'
      setTimeout(() => {
        emit('success')
        closeModal()
      }, 1500)
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } catch (err: unknown) {
    const errorMsg =
      (err as { message?: string }).message || 'Registration failed. Please try again.'
    error.value = errorMsg
  } finally {
    isLoading.value = false
  }
}

async function handleLogin() {
  if (isLoading.value) return

  // Validate form
  validateEmail()
  validatePassword()

  if (emailError.value || passwordError.value) {
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const loggedIn = await userStore.login(loginForm.value.email.trim(), loginForm.value.password)

    if (loggedIn) {
      success.value = 'Signed in successfully! 🎉'
      setTimeout(() => {
        emit('success')
        closeModal()
      }, 1000)
    } else {
      error.value = 'Invalid email or password. Please try again.'
    }
  } catch (err: unknown) {
    const errorMsg = (err as { message?: string }).message || 'Sign in failed. Please try again.'
    error.value = errorMsg
  } finally {
    isLoading.value = false
  }
}

function switchToRegister() {
  isRegistering.value = true
  clearError()
  clearForms()
}

function switchToLogin() {
  isRegistering.value = false
  clearError()
  clearForms()
}

function clearError() {
  error.value = ''
  emailError.value = ''
  passwordError.value = ''
}

function clearForms() {
  registerForm.value = {
    email: '',
    password: '',
    displayName: '',
  }
  loginForm.value = {
    email: '',
    password: '',
  }
  success.value = ''
}

function closeModal() {
  if (!isLoading.value) {
    clearError()
    clearForms()
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.close-button:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-description {
  text-align: center;
  color: #64748b;
  margin: 0 0 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-weight: 500;
  color: #334155;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.form-group input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-group small {
  color: #6b7280;
  font-size: 0.875rem;
}

.form-group .error-text {
  color: #ef4444;
}

.auth-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-button.primary {
  background: #dc2626;
  color: white;
}

.auth-button.primary:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.auth-button.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.auth-button.secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.divider {
  text-align: center;
  position: relative;
  margin: 1rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.link-button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  transition: color 0.2s;
}

.link-button:hover {
  color: #b91c1c;
}

.switch-mode {
  text-align: center;
  color: #64748b;
  margin: 0;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
}
</style>
