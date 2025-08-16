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
            <h2 class="username">学习者</h2>
            <p class="join-date">Member since: {{ formatDate(new Date()) }}</p>
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
              <input type="checkbox" v-model="preferences.speakingTasks" />
              <span class="checkmark"></span>
              Speaking Tasks
            </label>
            <label class="preference-item">
              <input type="checkbox" v-model="preferences.readingTasks" />
              <span class="checkmark"></span>
              Reading Tasks
            </label>
            <label class="preference-item">
              <input type="checkbox" v-model="preferences.writingTasks" />
              <span class="checkmark"></span>
              Writing Tasks
            </label>
            <label class="preference-item">
              <input type="checkbox" v-model="preferences.showPinyin" />
              <span class="checkmark"></span>
              Show Pinyin
            </label>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '../components/PageLayout.vue'

const stats = ref({
  wordsLearned: 152,
  daysStreak: 7,
  tasksCompleted: 89,
  totalHours: 12.5,
})

const preferences = ref({
  speakingTasks: true,
  readingTasks: true,
  writingTasks: false,
  showPinyin: true,
})

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
}
</style>
