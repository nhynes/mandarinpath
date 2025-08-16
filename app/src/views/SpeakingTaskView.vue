<template>
  <PageLayout>
    <div class="speaking-content">
      <div class="task-header">
        <button @click="$router.go(-1)" class="back-button">← Back</button>
        <h1 class="task-title">Speaking Practice</h1>
        <div class="progress-indicator">
          <span class="current-word">{{ currentWordIndex + 1 }}</span> /
          <span class="total-words">{{ words.length }}</span>
        </div>
      </div>

      <div class="speaking-card">
        <div class="word-display">
          <div class="chinese-character">{{ currentWord.chinese }}</div>
          <div class="pinyin" v-if="showPinyin || hasAttempted">
            {{ currentWord.pinyin }}
          </div>
          <div class="definition">{{ currentWord.definition }}</div>
        </div>

        <div class="recording-section">
          <div class="recording-controls">
            <button
              @mousedown="startRecording"
              @mouseup="stopRecording"
              @touchstart="startRecording"
              @touchend="stopRecording"
              :class="['record-button', { recording: isRecording }]"
              :disabled="isProcessing"
            >
              <div class="record-icon">
                <span v-if="!isRecording && !isProcessing">🎤</span>
                <span v-else-if="isRecording" class="recording-pulse">●</span>
                <span v-else>⏳</span>
              </div>
              <div class="record-text">
                <span v-if="!isRecording && !isProcessing">Hold to Record</span>
                <span v-else-if="isRecording">Recording...</span>
                <span v-else>Processing...</span>
              </div>
            </button>
          </div>

          <div class="recording-help">
            <p>Hold the button and speak the word clearly</p>
          </div>
        </div>

        <div class="feedback-section" v-if="lastAttempt">
          <div class="feedback-header">
            <h3 class="feedback-title">Feedback</h3>
            <div class="score" :class="getScoreClass(lastAttempt.score)">
              {{ lastAttempt.score }}%
            </div>
          </div>

          <div class="feedback-content">
            <div class="pronunciation-feedback">
              <p class="feedback-text">{{ lastAttempt.feedback }}</p>
              <div class="audio-comparison" v-if="lastAttempt.recordingUrl">
                <div class="audio-item">
                  <label>Your pronunciation:</label>
                  <audio :src="lastAttempt.recordingUrl" controls></audio>
                </div>
                <div class="audio-item">
                  <label>Target pronunciation:</label>
                  <button @click="playTargetAudio" class="play-target-button">
                    🔊 Play Target
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="task-actions">
          <button @click="skipWord" class="skip-button">Skip Word</button>
          <button @click="togglePinyin" class="hint-button">
            {{ showPinyin ? 'Hide' : 'Show' }} Pinyin
          </button>
          <button @click="nextWord" class="next-button" :disabled="!hasAttempted">Next Word</button>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'

interface Word {
  chinese: string
  pinyin: string
  definition: string
}

interface Attempt {
  score: number
  feedback: string
  recordingUrl?: string
}

const router = useRouter()

const words = ref<Word[]>([
  { chinese: '你好', pinyin: 'nǐ hǎo', definition: 'hello' },
  { chinese: '谢谢', pinyin: 'xiè xiè', definition: 'thank you' },
  { chinese: '再见', pinyin: 'zài jiàn', definition: 'goodbye' },
  { chinese: '学习', pinyin: 'xué xí', definition: 'to study/learn' },
  { chinese: '中文', pinyin: 'zhōng wén', definition: 'Chinese language' },
])

const currentWordIndex = ref(0)
const isRecording = ref(false)
const isProcessing = ref(false)
const showPinyin = ref(false)
const hasAttempted = ref(false)
const lastAttempt = ref<Attempt | null>(null)

const currentWord = computed(() => words.value[currentWordIndex.value])

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

const startRecording = async () => {
  if (isProcessing.value) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      processRecording(audioBlob)
      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (error) {
    console.error('Error accessing microphone:', error)
    alert('Unable to access microphone. Please check your permissions.')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
    isProcessing.value = true
  }
}

const processRecording = async (audioBlob: Blob) => {
  const audioUrl = URL.createObjectURL(audioBlob)

  setTimeout(() => {
    const scores = [85, 92, 78, 95, 88]
    const feedbacks = [
      'Good pronunciation! Try to emphasize the tone changes more clearly.',
      'Excellent! Your tones are very clear.',
      'The consonants are clear, but work on the vowel sounds.',
      'Perfect pronunciation! Well done.',
      'Good attempt. Focus on the rising tone in the second syllable.',
    ]

    const randomIndex = Math.floor(Math.random() * scores.length)

    lastAttempt.value = {
      score: scores[randomIndex],
      feedback: feedbacks[randomIndex],
      recordingUrl: audioUrl,
    }

    hasAttempted.value = true
    isProcessing.value = false
  }, 2000)
}

const playTargetAudio = () => {
  const utterance = new SpeechSynthesisUtterance(currentWord.value.chinese)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.7
  speechSynthesis.speak(utterance)
}

const togglePinyin = () => {
  showPinyin.value = !showPinyin.value
}

const skipWord = () => {
  nextWord()
}

const nextWord = () => {
  if (currentWordIndex.value < words.value.length - 1) {
    currentWordIndex.value++
    resetCurrentWord()
  } else {
    alert("Congratulations! You've completed all speaking tasks.")
    router.push('/')
  }
}

const resetCurrentWord = () => {
  hasAttempted.value = false
  lastAttempt.value = null
  showPinyin.value = false
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'fair'
  return 'needs-work'
}

onMounted(() => {
  playTargetAudio()
})
</script>

<style scoped>
.speaking-content {
  max-width: 900px;
  margin: 0 auto;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.back-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.task-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.progress-indicator {
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  color: #374151;
}

.speaking-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.word-display {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.chinese-character {
  font-size: 4rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
  line-height: 1;
}

.pinyin {
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 1rem;
  font-style: italic;
}

.definition {
  font-size: 1.125rem;
  color: #4b5563;
}

.recording-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.record-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.record-button:hover {
  transform: scale(1.05);
}

.record-button.recording {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  animation: pulse 1s infinite;
}

.record-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.record-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.recording-pulse {
  animation: pulse 0.5s infinite;
}

.record-text {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.recording-help {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.feedback-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.feedback-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
}

.score {
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: white;
}

.score.excellent {
  background: #10b981;
}

.score.good {
  background: #3b82f6;
}

.score.fair {
  background: #f59e0b;
}

.score.needs-work {
  background: #ef4444;
}

.feedback-text {
  color: #374151;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.audio-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.audio-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.audio-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.play-target-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.task-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.skip-button,
.hint-button,
.next-button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.skip-button {
  background: #6b7280;
  color: white;
}

.hint-button {
  background: #8b5cf6;
  color: white;
}

.next-button {
  background: #10b981;
  color: white;
}

.next-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .chinese-character {
    font-size: 3rem;
  }

  .audio-comparison {
    grid-template-columns: 1fr;
  }

  .task-actions {
    flex-direction: column;
  }
}
</style>
