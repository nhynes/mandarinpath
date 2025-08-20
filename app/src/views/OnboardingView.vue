<template>
  <div class="onboarding-container">
    <div class="onboarding-content">
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
        <div class="step-indicator">{{ currentStep }} of {{ totalSteps }}</div>
      </div>

      <!-- Question Content -->
      <div class="question-section">
        <div class="question-header">
          <h1 class="question-title">{{ currentQuestion.title }}</h1>
          <p v-if="currentQuestion.subtitle" class="question-subtitle">
            {{ currentQuestion.subtitle }}
          </p>
        </div>

        <!-- Question Types -->
        <div class="question-content">
          <!-- Multiple Choice -->
          <div v-if="currentQuestion.type === 'choice'" class="choice-options">
            <button
              v-for="option in currentQuestion.options"
              :key="option.id"
              @click="selectOption(option)"
              :class="['choice-option', { active: isOptionSelected(option) }]"
            >
              <div class="option-icon">{{ option.icon }}</div>
              <div class="option-text">
                <div class="option-title">{{ option.title }}</div>
                <div v-if="option.description" class="option-description">
                  {{ option.description }}
                </div>
              </div>
            </button>
          </div>

          <!-- Scale/Rating -->
          <div v-else-if="currentQuestion.type === 'scale'" class="scale-options">
            <div class="scale-container">
              <div class="scale-labels">
                <span class="scale-label">{{
                  currentQuestion.scaleLabels?.start || 'Beginner'
                }}</span>
                <span class="scale-label">{{
                  currentQuestion.scaleLabels?.end || 'Advanced'
                }}</span>
              </div>
              <div class="scale-slider">
                <input
                  type="range"
                  :min="1"
                  :max="currentQuestion.scaleMax || 5"
                  v-model="scaleValue"
                  @input="selectScaleValue"
                  class="slider"
                />
                <div class="scale-values">
                  <span
                    v-for="n in currentQuestion.scaleMax || 5"
                    :key="n"
                    :class="['scale-value', { active: scaleValue >= n }]"
                  >
                    {{ n }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Text Input -->
          <div v-else-if="currentQuestion.type === 'text'" class="text-input">
            <input
              type="text"
              v-model="textValue"
              @input="selectTextValue"
              :placeholder="currentQuestion.placeholder"
              class="text-field"
            />
          </div>

          <!-- Multiple Select -->
          <div v-else-if="currentQuestion.type === 'multiselect'" class="multiselect-options">
            <button
              v-for="option in currentQuestion.options"
              :key="option.id"
              @click="toggleMultiOption(option)"
              :class="['multiselect-option', { active: isMultiOptionSelected(option) }]"
            >
              <div class="option-icon">{{ option.icon }}</div>
              <div class="option-text">{{ option.title }}</div>
              <div class="check-indicator">
                <span v-if="isMultiOptionSelected(option)">✓</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="navigation-section">
        <button v-if="currentStep > 1" @click="previousStep" class="nav-button secondary">
          ← Back
        </button>
        <div class="nav-spacer"></div>
        <button
          @click="nextStep"
          :disabled="!canProceed"
          :class="['nav-button', 'primary', { disabled: !canProceed }]"
        >
          {{ isLastStep ? 'Complete Setup' : 'Continue' }}
          <span v-if="!isLastStep">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface OnboardingOption {
  id: string
  title: string
  description?: string
  icon: string
  value: string | number
}

interface OnboardingQuestion {
  id: string
  title: string
  subtitle?: string
  type: 'choice' | 'scale' | 'text' | 'multiselect'
  options?: OnboardingOption[]
  scaleMax?: number
  scaleLabels?: { start: string; end: string }
  placeholder?: string
  required?: boolean
  condition?: (answers: Record<string, string | number | string[]>) => boolean
}

const router = useRouter()
const userStore = useUserStore()

const currentStep = ref(1)
const answers = ref<Record<string, string | number | string[]>>({})
const scaleValue = ref(3)
const textValue = ref('')

const questions: OnboardingQuestion[] = [
  {
    id: 'learning_goal',
    title: "What's your main goal for learning Chinese?",
    subtitle: 'This helps us personalize your learning experience',
    type: 'choice',
    required: true,
    options: [
      {
        id: 'hsk_exam',
        title: 'Prepare for HSK Exam',
        description: 'Structured preparation for official Chinese proficiency test',
        icon: '📋',
        value: 'hsk_exam',
      },
      {
        id: 'travel',
        title: 'Travel & Tourism',
        description: 'Basic conversation for traveling in China',
        icon: '✈️',
        value: 'travel',
      },
      {
        id: 'business',
        title: 'Business & Career',
        description: 'Professional communication and business Chinese',
        icon: '💼',
        value: 'business',
      },
      {
        id: 'academic',
        title: 'Academic Studies',
        description: 'University-level Chinese for education',
        icon: '🎓',
        value: 'academic',
      },
      {
        id: 'culture',
        title: 'Culture & Heritage',
        description: 'Connect with Chinese culture and family heritage',
        icon: '🏮',
        value: 'culture',
      },
      {
        id: 'general',
        title: 'General Interest',
        description: 'Personal interest and lifelong learning',
        icon: '🌟',
        value: 'general',
      },
    ],
  },
  {
    id: 'hsk_level',
    title: 'Which HSK level are you preparing for?',
    subtitle: "We'll create a focused study plan for your target HSK exam",
    type: 'choice',
    required: true,
    condition: (answers: Record<string, string | number | string[]>) =>
      answers.learning_goal === 'hsk_exam',
    options: [
      {
        id: 'hsk1',
        title: 'HSK 1',
        description: '150 words, basic survival phrases',
        icon: '🌱',
        value: 'hsk1',
      },
      {
        id: 'hsk2',
        title: 'HSK 2',
        description: '300 words, simple daily conversations',
        icon: '📚',
        value: 'hsk2',
      },
      {
        id: 'hsk3',
        title: 'HSK 3',
        description: '600 words, intermediate conversations',
        icon: '💬',
        value: 'hsk3',
      },
      {
        id: 'hsk4',
        title: 'HSK 4',
        description: '1200 words, discuss various topics',
        icon: '🎯',
        value: 'hsk4',
      },
      {
        id: 'hsk5',
        title: 'HSK 5',
        description: '2500 words, read newspapers and magazines',
        icon: '📰',
        value: 'hsk5',
      },
      {
        id: 'hsk6',
        title: 'HSK 6',
        description: '5000+ words, near-native comprehension',
        icon: '🏆',
        value: 'hsk6',
      },
    ],
  },
  {
    id: 'current_level',
    title: 'How would you rate your current Chinese level?',
    subtitle: "Be honest - we'll adjust the difficulty accordingly",
    type: 'choice',
    required: true,
    options: [
      {
        id: 'absolute_beginner',
        title: 'Absolute Beginner',
        description: 'No prior knowledge of Chinese',
        icon: '🌱',
        value: 1,
      },
      {
        id: 'beginner',
        title: 'Beginner',
        description: 'Know some basic words and phrases',
        icon: '📚',
        value: 2,
      },
      {
        id: 'elementary',
        title: 'Elementary',
        description: 'Can have simple conversations',
        icon: '🗣️',
        value: 3,
      },
      {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'Comfortable with daily conversations',
        icon: '💬',
        value: 4,
      },
      {
        id: 'advanced',
        title: 'Advanced',
        description: 'Fluent in most situations',
        icon: '🎯',
        value: 5,
      },
    ],
  },
  {
    id: 'learning_focus',
    title: 'Which skills do you want to prioritize?',
    subtitle: 'Select all that apply - you can change this later',
    type: 'multiselect',
    required: true,
    options: [
      {
        id: 'speaking',
        title: 'Speaking & Pronunciation',
        icon: '🗣️',
        value: 'speaking',
      },
      {
        id: 'listening',
        title: 'Listening Comprehension',
        icon: '👂',
        value: 'listening',
      },
      {
        id: 'reading',
        title: 'Reading Characters',
        icon: '📖',
        value: 'reading',
      },
      {
        id: 'writing',
        title: 'Writing Characters',
        icon: '✍️',
        value: 'writing',
      },
    ],
  },
  {
    id: 'study_time',
    title: 'How much time can you dedicate to studying daily?',
    subtitle: 'This helps us create realistic learning goals',
    type: 'choice',
    required: true,
    options: [
      {
        id: 'casual',
        title: '5-10 minutes',
        description: 'Quick daily practice',
        icon: '☕',
        value: 10,
      },
      {
        id: 'regular',
        title: '15-30 minutes',
        description: 'Consistent daily learning',
        icon: '📅',
        value: 25,
      },
      {
        id: 'dedicated',
        title: '30-60 minutes',
        description: 'Serious daily commitment',
        icon: '💪',
        value: 45,
      },
      {
        id: 'intensive',
        title: '1+ hours',
        description: 'Intensive study schedule',
        icon: '🚀',
        value: 90,
      },
    ],
  },
  {
    id: 'proficiency_goal',
    title: 'What level of proficiency do you want to achieve?',
    subtitle: 'This helps us create a structured learning path with clear milestones',
    type: 'choice',
    required: true,
    condition: (answers: Record<string, string | number | string[]>) =>
      answers.learning_goal !== 'hsk_exam',
    options: [
      {
        id: 'basic',
        title: 'Basic Communication',
        description: 'Essential phrases for daily situations',
        icon: '💬',
        value: 'basic',
      },
      {
        id: 'conversational',
        title: 'Conversational Fluency',
        description: 'Comfortable in most daily situations',
        icon: '🗣️',
        value: 'conversational',
      },
      {
        id: 'business_fluency',
        title: 'Professional Proficiency',
        description: 'Business communication and presentations',
        icon: '💼',
        value: 'business',
      },
      {
        id: 'advanced',
        title: 'Advanced Fluency',
        description: 'Near-native level comprehension and expression',
        icon: '🎯',
        value: 'advanced',
      },
      {
        id: 'cultural',
        title: 'Cultural Mastery',
        description: 'Appreciate literature, media, and cultural nuances',
        icon: '🏮',
        value: 'cultural',
      },
    ],
  },
  {
    id: 'timeline',
    title: 'In what timeframe do you want to achieve this goal?',
    subtitle: 'This is just a target - everyone learns at their own pace',
    type: 'choice',
    required: true,
    options: [
      {
        id: 'relaxed',
        title: '1-2 years',
        description: 'Steady, relaxed pace',
        icon: '🐢',
        value: 24,
      },
      {
        id: 'moderate',
        title: '6-12 months',
        description: 'Balanced but consistent',
        icon: '🚶',
        value: 9,
      },
      {
        id: 'accelerated',
        title: '3-6 months',
        description: 'Fast-track learning',
        icon: '🏃',
        value: 4,
      },
      {
        id: 'immersive',
        title: '1-3 months',
        description: 'Intensive immersion',
        icon: '🚀',
        value: 2,
      },
    ],
  },
  {
    id: 'motivation',
    title: 'What motivates you most when learning?',
    subtitle: "We'll customize your experience to keep you engaged",
    type: 'choice',
    required: true,
    options: [
      {
        id: 'progress',
        title: 'Seeing Progress',
        description: 'Visual progress tracking and achievements',
        icon: '📈',
        value: 'progress',
      },
      {
        id: 'streaks',
        title: 'Daily Streaks',
        description: 'Maintaining consistent daily practice',
        icon: '🔥',
        value: 'streaks',
      },
      {
        id: 'challenges',
        title: 'Challenges & Games',
        description: 'Competitive elements and fun challenges',
        icon: '🎮',
        value: 'challenges',
      },
      {
        id: 'practical',
        title: 'Real-world Application',
        description: 'Learning useful, practical phrases',
        icon: '🌍',
        value: 'practical',
      },
    ],
  },
]

// Filter questions based on conditions
const filteredQuestions = computed(() => {
  return questions.filter((question) => {
    if (!question.condition) return true
    return question.condition(answers.value)
  })
})

const totalSteps = computed(() => filteredQuestions.value.length)
const currentQuestion = computed(() => {
  const question = filteredQuestions.value[currentStep.value - 1]
  
  // Make learning focus subtitle dynamic for HSK exam
  if (question?.id === 'learning_focus' && answers.value.learning_goal === 'hsk_exam') {
    return {
      ...question,
      subtitle: 'Pre-selected for HSK exam: Speaking, Listening & Reading - you can adjust these'
    }
  }
  
  return question
})
const isLastStep = computed(() => currentStep.value === totalSteps.value)

const canProceed = computed(() => {
  const question = currentQuestion.value
  if (!question.required) return true

  const answer = answers.value[question.id]

  switch (question.type) {
    case 'choice':
      return !!answer
    case 'scale':
      return !!answer
    case 'text':
      return !!(answer && typeof answer === 'string' && answer.trim())
    case 'multiselect':
      return !!(answer && Array.isArray(answer) && answer.length > 0)
    default:
      return false
  }
})

function selectOption(option: OnboardingOption) {
  answers.value[currentQuestion.value.id] = option.value
  
  // Auto-select learning focus for HSK exam preparation
  if (currentQuestion.value.id === 'learning_goal') {
    if (option.value === 'hsk_exam') {
      // HSK exams require speaking, listening, and reading but not writing
      answers.value.learning_focus = ['speaking', 'listening', 'reading']
    } else {
      // Clear auto-selection if switching away from HSK exam
      if (answers.value.learning_focus && 
          Array.isArray(answers.value.learning_focus) && 
          answers.value.learning_focus.length === 3 &&
          answers.value.learning_focus.includes('speaking') &&
          answers.value.learning_focus.includes('listening') &&
          answers.value.learning_focus.includes('reading') &&
          !answers.value.learning_focus.includes('writing')) {
        // This looks like an HSK auto-selection, clear it
        delete answers.value.learning_focus
      }
    }
  }
}

function isOptionSelected(option: OnboardingOption): boolean {
  return answers.value[currentQuestion.value.id] === option.value
}

function selectScaleValue() {
  answers.value[currentQuestion.value.id] = parseInt(scaleValue.value.toString())
}

function selectTextValue() {
  answers.value[currentQuestion.value.id] = textValue.value
}

function toggleMultiOption(option: OnboardingOption) {
  const questionId = currentQuestion.value.id
  if (!answers.value[questionId]) {
    answers.value[questionId] = []
  }

  const currentAnswers = answers.value[questionId] as (string | number)[]
  const index = currentAnswers.indexOf(option.value)

  if (index === -1) {
    currentAnswers.push(option.value)
  } else {
    currentAnswers.splice(index, 1)
  }
}

function isMultiOptionSelected(option: OnboardingOption): boolean {
  const questionId = currentQuestion.value.id
  const currentAnswers = answers.value[questionId] as (string | number)[]
  return currentAnswers?.includes(option.value) || false
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
    resetCurrentInputs()
  }
}

function nextStep() {
  if (!canProceed.value) return

  if (isLastStep.value) {
    completeOnboarding()
  } else {
    currentStep.value++
    resetCurrentInputs()
  }
}

function resetCurrentInputs() {
  const question = currentQuestion.value
  const answer = answers.value[question.id]

  switch (question.type) {
    case 'scale':
      scaleValue.value = typeof answer === 'number' ? answer : 3
      break
    case 'text':
      textValue.value = typeof answer === 'string' ? answer : ''
      break
  }
}

async function completeOnboarding() {
  try {
    // Save onboarding data to user preferences
    const onboardingData = {
      learningGoal: answers.value.learning_goal,
      currentLevel: answers.value.current_level,
      learningFocus: answers.value.learning_focus,
      studyTime: answers.value.study_time,
      hsKLevel: answers.value.hsk_level, // For HSK exam preparation
      proficiencyGoal: answers.value.proficiency_goal, // For other learning goals
      timeline: answers.value.timeline,
      motivation: answers.value.motivation,
      onboardingCompleted: true,
      onboardingDate: new Date().toISOString(),
    }

    // Store in localStorage for now (could be saved to backend later)
    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData))

    // Update user preferences based on onboarding
    const learningFocus = answers.value.learning_focus as string[] | undefined
    const currentLevel = answers.value.current_level as number | undefined

    const preferences = {
      speakingTasks: learningFocus?.includes('speaking') ?? true,
      readingTasks: learningFocus?.includes('reading') ?? true,
      writingTasks: learningFocus?.includes('writing') ?? false,
      showPinyin: currentLevel ? currentLevel <= 2 : true,
    }

    userStore.updatePreferences(preferences)

    // Navigate to dashboard
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    // Show error message to user
    alert('There was an error saving your preferences. Please try again.')
  }
}

onMounted(() => {
  resetCurrentInputs()
})
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.onboarding-content {
  background: white;
  border-radius: 1rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #dc2626;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.step-indicator {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* Question Section */
.question-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-header {
  text-align: center;
}

.question-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.question-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Choice Options */
.choice-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.choice-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.choice-option:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.choice-option.active {
  background: #fef2f2;
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

.option-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

/* Scale Options */
.scale-options {
  padding: 1rem 0;
}

.scale-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.scale-slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #dc2626;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #dc2626;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.scale-values {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.scale-value {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 50%;
  transition: all 0.2s;
}

.scale-value.active {
  background: #dc2626;
  color: white;
}

/* Text Input */
.text-input {
  padding: 1rem 0;
}

.text-field {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.text-field:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

/* Multiselect Options */
.multiselect-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.multiselect-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.multiselect-option:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.multiselect-option.active {
  background: #fef2f2;
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

.check-indicator {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #dc2626;
  font-weight: 600;
}

.multiselect-option.active .check-indicator {
  border-color: #dc2626;
  background: #dc2626;
  color: white;
}

/* Navigation Section */
.navigation-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.nav-spacer {
  flex: 1;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-button.primary {
  background: #dc2626;
  color: white;
  border: 2px solid #dc2626;
}

.nav-button.primary:hover:not(.disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.nav-button.secondary {
  background: white;
  color: #374151;
  border: 2px solid #d1d5db;
}

.nav-button.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.nav-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 640px) {
  .onboarding-content {
    padding: 1.5rem;
    margin: 0.5rem;
  }

  .question-title {
    font-size: 1.5rem;
  }

  .choice-option,
  .multiselect-option {
    padding: 0.875rem;
  }

  .option-icon {
    font-size: 1.25rem;
  }

  .navigation-section {
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-spacer {
    display: none;
  }

  .nav-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
