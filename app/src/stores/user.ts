import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService, type User } from '@/services/auth'

export interface UserStats {
  streak: number
  wordsThisWeek: number
  totalWords: number
  minutesToday: number
  tasksCompleted: number
  totalHours: number
  daysStreak: number
  wordsLearned: number
}

export interface UserPreferences {
  speakingTasks: boolean
  readingTasks: boolean
  writingTasks: boolean
  showPinyin: boolean
}

export interface RecentActivity {
  id: number
  icon: string
  text: string
  time: string
  score: string
  type: 'speaking' | 'reading' | 'writing'
}

export const useUserStore = defineStore('user', () => {
  const stats = ref<UserStats>({
    streak: 7,
    wordsThisWeek: 23,
    totalWords: 156,
    minutesToday: 15,
    tasksCompleted: 89,
    totalHours: 12.5,
    daysStreak: 7,
    wordsLearned: 152,
  })

  const preferences = ref<UserPreferences>({
    speakingTasks: true,
    readingTasks: true,
    writingTasks: false,
    showPinyin: true,
  })

  const recentActivities = ref<RecentActivity[]>([
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

  const currentUser = ref<User | null>(authService.getCurrentUser())
  const isLoggedIn = computed(() => authService.isAuthenticated())

  function updateStats(newStats: Partial<UserStats>) {
    Object.assign(stats.value, newStats)
  }

  function updatePreferences(newPrefs: Partial<UserPreferences>) {
    Object.assign(preferences.value, newPrefs)
  }

  function addRecentActivity(activity: Omit<RecentActivity, 'id'>) {
    const newActivity = {
      ...activity,
      id: Date.now(),
    }
    recentActivities.value.unshift(newActivity)
    if (recentActivities.value.length > 10) {
      recentActivities.value.pop()
    }
  }

  function incrementStreak() {
    stats.value.streak++
    stats.value.daysStreak++
  }

  function resetStreak() {
    stats.value.streak = 0
    stats.value.daysStreak = 0
  }

  function addWordsLearned(count: number) {
    stats.value.wordsLearned += count
    stats.value.totalWords += count
    stats.value.wordsThisWeek += count
  }

  function addStudyTime(minutes: number) {
    stats.value.minutesToday += minutes
    stats.value.totalHours += minutes / 60
  }

  function completeTask() {
    stats.value.tasksCompleted++
  }

  // Authentication functions
  async function login(email: string, password: string): Promise<boolean> {
    try {
      await authService.login(email, password)
      currentUser.value = authService.getCurrentUser()
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async function register(email: string, password: string, displayName?: string): Promise<boolean> {
    try {
      await authService.register(email, password, displayName)
      currentUser.value = authService.getCurrentUser()
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout()
      currentUser.value = null
      // Reset user data on logout
      stats.value = {
        streak: 0,
        wordsThisWeek: 0,
        totalWords: 0,
        minutesToday: 0,
        tasksCompleted: 0,
        totalHours: 0,
        daysStreak: 0,
        wordsLearned: 0,
      }
      recentActivities.value = []
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  async function logoutAll(): Promise<void> {
    try {
      await authService.logoutAll()
      currentUser.value = null
      // Reset user data on logout
      stats.value = {
        streak: 0,
        wordsThisWeek: 0,
        totalWords: 0,
        minutesToday: 0,
        tasksCompleted: 0,
        totalHours: 0,
        daysStreak: 0,
        wordsLearned: 0,
      }
      recentActivities.value = []
    } catch (error) {
      console.error('Logout all failed:', error)
    }
  }

  // Validation functions for forms
  function validateEmail(email: string): boolean {
    return authService.validateEmail(email)
  }

  function validatePassword(password: string): { valid: boolean; message?: string } {
    return authService.validatePassword(password)
  }

  return {
    stats,
    preferences,
    recentActivities,
    currentUser,
    isLoggedIn,
    updateStats,
    updatePreferences,
    addRecentActivity,
    incrementStreak,
    resetStreak,
    addWordsLearned,
    addStudyTime,
    completeTask,
    login,
    register,
    logout,
    logoutAll,
    validateEmail,
    validatePassword,
  }
})
