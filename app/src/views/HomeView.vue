<template>
  <PageLayout>
    <div class="dashboard">
      <!-- Main Content Grid -->
      <div class="main-grid">
        <!-- Stats Summary -->
        <div class="stats-panel">
          <div class="streak">
            <div class="streak-number">{{ userStats.streak }}</div>
            <div class="streak-label">Day Streak</div>
          </div>
          <div class="stats-row">
            <div class="stat">
              <div class="stat-value">{{ userStats.totalWords }}</div>
              <div class="stat-label">Words</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ userStats.minutesToday }}</div>
              <div class="stat-label">Minutes</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ userStats.tasksCompleted }}</div>
              <div class="stat-label">Tasks</div>
            </div>
          </div>
        </div>

        <!-- Practice Tasks -->
        <div class="tasks-panel">
          <div class="panel-header">
            <h2>Practice</h2>
          </div>
          <div class="task-list">
            <div class="task-item" @click="startTask('speaking')">
              <span class="task-icon">🗣️</span>
              <span class="task-name">Speaking</span>
              <span class="task-arrow">›</span>
            </div>
            <div class="task-item" @click="startTask('reading')">
              <span class="task-icon">📖</span>
              <span class="task-name">Reading</span>
              <span class="task-arrow">›</span>
            </div>
            <div class="task-item" @click="startTask('writing')">
              <span class="task-icon">✍️</span>
              <span class="task-name">Writing</span>
              <span class="task-arrow">›</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-panel">
          <div class="panel-header">
            <h2>Actions</h2>
          </div>
          <div class="action-list">
            <button @click="$router.push('/loading')" class="action-item">
              <span class="action-icon">📚</span>
              <span class="action-name">Add Words</span>
            </button>
            <button @click="$router.push('/profile')" class="action-item">
              <span class="action-icon">📊</span>
              <span class="action-name">Progress</span>
            </button>
            <button @click="reviewWeakWords" class="action-item">
              <span class="action-icon">🎯</span>
              <span class="action-name">Review</span>
            </button>
            <button @click="dailyChallenge" class="action-item">
              <span class="action-icon">🏆</span>
              <span class="action-name">Challenge</span>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-panel" v-if="recentActivities.length > 0">
          <div class="panel-header">
            <h2>Recent</h2>
          </div>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities.slice(0, 4)"
              :key="activity.id"
              class="activity-item"
            >
              <span class="activity-icon">{{ activity.icon }}</span>
              <div class="activity-info">
                <div class="activity-name">{{ getActivityName(activity) }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <div class="activity-score" :class="activity.type">
                {{ activity.score }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'

const router = useRouter()

const userStats = reactive({
  streak: 7,
  wordsThisWeek: 23,
  totalWords: 156,
  minutesToday: 15,
  tasksCompleted: 89,
})

const recentActivities = ref([
  {
    id: 1,
    icon: '🗣️',
    text: 'Completed speaking practice with "你好"',
    time: '2 hours ago',
    score: '92%',
    type: 'speaking',
  },
  {
    id: 2,
    icon: '📖',
    text: 'Read story "小明的一天"',
    time: '1 day ago',
    score: 'Complete',
    type: 'reading',
  },
  {
    id: 3,
    icon: '✍️',
    text: 'Practiced writing character "人"',
    time: '2 days ago',
    score: '85%',
    type: 'writing',
  },
])

const startTask = (taskType: string) => {
  switch (taskType) {
    case 'speaking':
      router.push('/tasks/speaking')
      break
    case 'reading':
      router.push('/tasks/reading')
      break
    case 'writing':
      router.push('/tasks/drawing')
      break
  }
}

const reviewWeakWords = () => {
  alert('Starting review of your challenging words...')
}

const dailyChallenge = () => {
  alert('Daily challenge coming soon! 🎉')
}

const getActivityName = (activity: { text: string }) => {
  if (activity.text.includes('speaking')) return 'Speaking Practice'
  if (activity.text.includes('story')) return 'Reading Practice'
  if (activity.text.includes('writing')) return 'Writing Practice'
  return activity.text
}
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.main-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

/* Panel Base Styles */
.stats-panel,
.tasks-panel,
.actions-panel,
.activity-panel {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.panel-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-header h2 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Stats Panel */
.stats-panel {
  padding: 1.25rem;
}

.streak {
  text-align: center;
  margin-bottom: 1.25rem;
}

.streak-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f59e0b;
  line-height: 1;
}

.streak-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.25rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat {
  text-align: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Task Panel */
.task-list {
  padding: 0;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background: #f8fafc;
}

.task-icon {
  font-size: 1.25rem;
  width: 2rem;
  text-align: center;
}

.task-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
  margin-left: 0.75rem;
}

.task-arrow {
  font-size: 1.125rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Actions Panel */
.action-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.action-item:nth-child(2n) {
  border-right: none;
}

.action-item:nth-child(n + 3) {
  border-bottom: none;
}

.action-item:hover {
  background: #f8fafc;
}

.action-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.action-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}

/* Activity Panel */
.activity-list {
  padding: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.125rem;
  width: 1.75rem;
  text-align: center;
}

.activity-info {
  flex: 1;
  margin-left: 0.75rem;
}

.activity-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.2;
}

.activity-time {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

.activity-score {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  color: white;
}

.activity-score.speaking {
  background: #f59e0b;
}

.activity-score.reading {
  background: #10b981;
}

.activity-score.writing {
  background: #8b5cf6;
}

/* Tablet */
@media (min-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .stats-panel {
    grid-column: 1 / -1;
  }

  .stats-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .action-list {
    grid-template-columns: repeat(4, 1fr);
  }

  .action-item:nth-child(2n) {
    border-right: 1px solid #f1f5f9;
  }

  .action-item:nth-child(4n) {
    border-right: none;
  }

  .action-item:nth-child(n + 5) {
    border-bottom: none;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 300px 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  .stats-panel {
    grid-column: 1;
    grid-row: 1 / 3;
  }

  .tasks-panel {
    grid-column: 2;
    grid-row: 1;
  }

  .actions-panel {
    grid-column: 3;
    grid-row: 1;
  }

  .activity-panel {
    grid-column: 2 / 4;
    grid-row: 2;
  }

  .stats-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat {
    padding: 1rem;
  }

  .action-list {
    grid-template-columns: 1fr 1fr;
  }

  .action-item:nth-child(2n) {
    border-right: none;
  }

  .action-item:nth-child(4n) {
    border-right: none;
  }

  .action-item:nth-child(n + 3) {
    border-bottom: none;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .main-grid {
    grid-template-columns: 320px 1fr 1fr 300px;
    gap: 2.5rem;
  }

  .stats-panel {
    grid-column: 1;
    grid-row: 1 / 3;
  }

  .tasks-panel {
    grid-column: 2;
    grid-row: 1;
  }

  .actions-panel {
    grid-column: 3;
    grid-row: 1;
  }

  .activity-panel {
    grid-column: 4;
    grid-row: 1 / 3;
  }
}
</style>
