<template>
  <PageLayout>
    <div class="profile-content">
      <h1 class="page-title">Profile</h1>

      <div class="profile-section">
        <div class="profile-header">
          <div class="avatar">
            <span class="avatar-icon">👤</span>
          </div>
          <div class="user-info">
            <h2 class="username">
              {{
                userStore.currentUser?.display_name ||
                userStore.currentUser?.email?.split('@')[0] ||
                'User'
              }}
            </h2>
            <p class="email">{{ userStore.currentUser?.email }}</p>
            <p class="join-date">
              Member since: {{ formatDate(userStore.currentUser?.created_at) }}
            </p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.wordsLearned }}</div>
            <div class="stat-label">Words Learned</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.daysStreak }}</div>
            <div class="stat-label">Day Streak</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.tasksCompleted }}</div>
            <div class="stat-label">Tasks Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalHours }}</div>
            <div class="stat-label">Total Hours</div>
          </div>
        </div>

        <div class="preferences-section">
          <h3 class="section-title">Learning Preferences</h3>
          <div class="preference-grid">
            <label class="preference-item">
              <input
                type="checkbox"
                v-model="userStore.preferences.speakingTasks"
                @change="handlePreferenceChange"
              />
              <span class="checkmark"></span>
              Speaking Tasks
            </label>
            <label class="preference-item">
              <input
                type="checkbox"
                v-model="userStore.preferences.readingTasks"
                @change="handlePreferenceChange"
              />
              <span class="checkmark"></span>
              Reading Tasks
            </label>
            <label class="preference-item">
              <input
                type="checkbox"
                v-model="userStore.preferences.writingTasks"
                @change="handlePreferenceChange"
              />
              <span class="checkmark"></span>
              Writing Tasks
            </label>
            <label class="preference-item">
              <input
                type="checkbox"
                v-model="userStore.preferences.showPinyin"
                @change="handlePreferenceChange"
              />
              <span class="checkmark"></span>
              Show Pinyin
            </label>
          </div>
        </div>

        <div class="account-section">
          <h3 class="section-title">Account Management</h3>
          <div class="account-actions">
            <div class="account-info">
              <div class="info-item">
                <label>Display Name</label>
                <div class="input-group">
                  <input
                    v-model="editingDisplayName"
                    type="text"
                    placeholder="Enter display name"
                    class="account-input"
                    :disabled="!isEditingDisplayName"
                  />
                  <button
                    @click="toggleEditDisplayName"
                    class="edit-button"
                    :class="{ active: isEditingDisplayName }"
                  >
                    {{ isEditingDisplayName ? 'Save' : 'Edit' }}
                  </button>
                </div>
              </div>

              <div class="info-item">
                <label>Email</label>
                <div class="input-group">
                  <input
                    v-model="editingEmail"
                    type="email"
                    placeholder="Enter email"
                    class="account-input"
                    :disabled="!isEditingEmail"
                  />
                  <button
                    @click="toggleEditEmail"
                    class="edit-button"
                    :class="{ active: isEditingEmail }"
                  >
                    {{ isEditingEmail ? 'Save' : 'Edit' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="showChangePasswordModal = true" class="action-button change-password">
                <span class="button-icon">🔑</span>
                Change Password
              </button>

              <button @click="handleLogout" class="action-button logout-current">
                <span class="button-icon">🚪</span>
                Logout
              </button>

              <button @click="handleLogoutAll" class="action-button logout-all">
                <span class="button-icon">🚫</span>
                Logout All Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePasswordModal" class="modal-overlay" @click="closeChangePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="close-button" @click="closeChangePasswordModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleChangePassword" class="password-form">
            <div class="form-group">
              <label>Current Password</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Enter current password"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Enter new password"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Confirm new password"
                required
                class="form-input"
              />
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeChangePasswordModal" class="cancel-button">
                Cancel
              </button>
              <button type="submit" class="save-button" :disabled="!isPasswordFormValid">
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import PageLayout from '../components/PageLayout.vue'

const router = useRouter()
const userStore = useUserStore()

// Reactive refs for stats from store
const stats = computed(() => userStore.stats)

// Account editing states
const isEditingDisplayName = ref(false)
const isEditingEmail = ref(false)
const editingDisplayName = ref(userStore.currentUser?.display_name || '')
const editingEmail = ref(userStore.currentUser?.email || '')

// Password change modal
const showChangePasswordModal = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Initialize editing values when user data changes
watch(
  () => userStore.currentUser,
  (user) => {
    if (user) {
      editingDisplayName.value = user.display_name || ''
      editingEmail.value = user.email || ''
    }
  },
  { immediate: true },
)

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword.length >= 8
  )
})

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handlePreferenceChange = () => {
  // Preferences are automatically updated through v-model binding to userStore.preferences
  // Could add API call here to persist preferences to backend
}

const toggleEditDisplayName = async () => {
  if (isEditingDisplayName.value) {
    // Save the display name
    try {
      // TODO: Add API call to update display name
      console.log('Updating display name to:', editingDisplayName.value)
      // For now, just update locally (would need backend API)
      isEditingDisplayName.value = false
    } catch (error) {
      console.error('Failed to update display name:', error)
    }
  } else {
    isEditingDisplayName.value = true
  }
}

const toggleEditEmail = async () => {
  if (isEditingEmail.value) {
    // Save the email
    try {
      // TODO: Add API call to update email
      console.log('Updating email to:', editingEmail.value)
      // For now, just update locally (would need backend API)
      isEditingEmail.value = false
    } catch (error) {
      console.error('Failed to update email:', error)
    }
  } else {
    isEditingEmail.value = true
  }
}

const handleChangePassword = async () => {
  try {
    // TODO: Add API call to change password
    console.log('Changing password...')
    // For now, just close the modal
    closeChangePasswordModal()
  } catch (error) {
    console.error('Failed to change password:', error)
  }
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/welcome')
}

const handleLogoutAll = async () => {
  await userStore.logoutAll()
  router.push('/welcome')
}
</script>

<style scoped>
.profile-content {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #1a202c;
}

.profile-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 2rem;
  color: white;
}

.username {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
}

.email {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.join-date {
  margin: 0.5rem 0 0 0;
  color: #64748b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.preferences-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a202c;
}

.preference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.preference-item input[type='checkbox'] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.preference-item input[type='checkbox']:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.preference-item input[type='checkbox']:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Account Management Styles */
.account-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.account-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.account-input:disabled {
  background: #f9fafb;
  color: #6b7280;
}

.account-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-button {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.edit-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.edit-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.edit-button.active:hover {
  background: #2563eb;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border: 1px solid;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  justify-content: flex-start;
}

.button-icon {
  font-size: 1.1rem;
}

.change-password {
  background: #f0f9ff;
  color: #0369a1;
  border-color: #7dd3fc;
}

.change-password:hover {
  background: #e0f2fe;
  border-color: #38bdf8;
}

.logout-current {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.logout-current:hover {
  background: #fef2e5;
  border-color: #f59e0b;
}

.logout-all {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.logout-all:hover {
  background: #fef1f1;
  border-color: #f87171;
}

/* Modal Styles */
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
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.close-button:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #f3f4f6;
}

.save-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #2563eb;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .preference-grid {
    grid-template-columns: 1fr;
  }

  .account-actions {
    gap: 1.5rem;
  }

  .action-buttons {
    order: -1;
  }

  .input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .edit-button {
    width: 100%;
  }
}
</style>
