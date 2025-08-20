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
              @mousedown="handleMouseDown"
              @mouseup="handleMouseUp"
              @touchstart="handleTouchStart"
              @touchend="handleTouchEnd"
              :class="['record-button', { recording: isRecording }]"
              :disabled="isProcessing"
            >
              <div class="record-icon">
                <span v-if="!isRecording && !isProcessing">🎤</span>
                <span v-else-if="isRecording" class="recording-pulse">●</span>
                <span v-else>⏳</span>
              </div>
              <div class="record-text">
                <span v-if="!isRecording && !isProcessing && !isClickToggleMode"
                  >Click or Hold to Record</span
                >
                <span v-else-if="!isRecording && !isProcessing && isClickToggleMode"
                  >Click to Stop</span
                >
                <span v-else-if="isRecording">Recording...</span>
                <span v-else>Processing...</span>
              </div>
            </button>
          </div>

          <div class="recording-help">
            <p v-if="!isClickToggleMode">
              Quick click to toggle recording mode, or hold the button to record
            </p>
            <p v-else>Recording mode active - click again to stop and submit</p>
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

              <!-- Detailed word-level feedback -->
              <div
                class="word-analysis"
                v-if="lastAttempt.detailedData && lastAttempt.detailedData.words"
              >
                <h4 class="analysis-title">Word Analysis</h4>
                <div class="word-scores">
                  <div
                    v-for="(word, index) in lastAttempt.detailedData.words"
                    :key="index"
                    class="word-score-item"
                    :class="getWordScoreClass(word.scores.pronunciation)"
                  >
                    <div class="word-text">{{ word.word }}</div>
                    <div class="word-pinyin" v-if="word.pinyin">{{ word.pinyin }}</div>
                    <div class="score-details">
                      <span class="score-label">Pronunciation:</span>
                      <span class="score-value">{{ Math.round(word.scores.pronunciation) }}%</span>
                      <span class="score-label" v-if="word.scores.tone">Tone:</span>
                      <span class="score-value" v-if="word.scores.tone"
                        >{{ Math.round(word.scores.tone) }}%</span
                      >
                    </div>
                    <div class="word-issues" v-if="getWordIssues(word).length > 0">
                      <div class="issue-tag" v-for="issue in getWordIssues(word)" :key="issue">
                        {{ issue }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

interface WordScore {
  word: string
  pinyin?: string
  tone?: string
  scores: {
    overall: number
    pronunciation: number
    tone?: number
    prominence?: number
  }
  read_type: number
  span?: {
    start: number
    end: number
  }
  phonemes?: PhonemeScore[]
}

interface PhonemeScore {
  phoneme: string
  pronunciation: number
  span?: {
    start: number
    end: number
  }
  tone_index?: number
  phone?: string
}

interface SpeechEvaluationData {
  overall_scores: Record<string, number>
  words: WordScore[]
  error?: string
}

interface Attempt {
  score: number
  feedback: string
  recordingUrl?: string
  detailedData?: SpeechEvaluationData
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
let mouseDownTime = 0
const isClickToggleMode = ref(false)

const handleMouseDown = async () => {
  if (isProcessing.value) return
  mouseDownTime = Date.now()

  // If already in click toggle mode and recording, do nothing on mousedown
  if (isClickToggleMode.value && isRecording.value) return

  // Start recording immediately
  await startRecording()
}

const handleMouseUp = () => {
  if (isProcessing.value) return

  const holdDuration = Date.now() - mouseDownTime
  const isQuickClick = holdDuration < 200 // Less than 200ms is considered a click

  if (isQuickClick) {
    // This was a click - toggle to click mode
    isClickToggleMode.value = !isClickToggleMode.value

    // If we're turning off click mode, stop recording
    if (!isClickToggleMode.value && isRecording.value) {
      stopRecording()
    }
  } else {
    // This was a hold - stop recording if we're not in click toggle mode
    if (!isClickToggleMode.value && isRecording.value) {
      stopRecording()
    }
  }
}

const handleTouchStart = async () => {
  if (isProcessing.value) return
  mouseDownTime = Date.now()

  if (isClickToggleMode.value && isRecording.value) return

  await startRecording()
}

const handleTouchEnd = () => {
  if (isProcessing.value) return

  const holdDuration = Date.now() - mouseDownTime
  const isQuickClick = holdDuration < 200

  if (isQuickClick) {
    isClickToggleMode.value = !isClickToggleMode.value

    if (!isClickToggleMode.value && isRecording.value) {
      stopRecording()
    }
  } else {
    if (!isClickToggleMode.value && isRecording.value) {
      stopRecording()
    }
  }
}

const startRecording = async () => {
  if (isProcessing.value || isRecording.value) return

  // Set recording state immediately for visual feedback
  isRecording.value = true

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
    // Recording state already set above for immediate feedback
  } catch (error) {
    console.error('Error accessing microphone:', error)
    // Reset recording state on error
    isRecording.value = false
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

  try {
    // Create FormData to send audio and parameters
    const formData = new FormData()

    // Add audio file
    formData.append('audio', audioBlob, 'recording.webm')

    // Add parameters
    const params = {
      ref_text: currentWord.value.chinese,
      lang: 'cn',
      core: 'sent',
      ref_pinyin: currentWord.value.pinyin,
      phoneme_output: true,
    }
    formData.append('params', JSON.stringify(params))

    // Add audio metadata
    formData.append('encoding', 'lame') // Will need to convert webm to mp3
    formData.append('sample_rate', '16000')
    formData.append('channels', '1')
    formData.append('bit_depth', '16')

    // Send request to backend
    const response = await fetch('/api/speech/evaluate', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Speech evaluation failed')
    }

    const evaluationData = result.data as SpeechEvaluationData

    // Calculate overall score from iFlytek response
    const overallScore = Math.round(evaluationData.overall_scores?.pronunciation || 0)

    // Generate feedback based on word-level scores
    const feedback = generateFeedback(evaluationData)

    lastAttempt.value = {
      score: overallScore,
      feedback: feedback,
      recordingUrl: audioUrl,
      detailedData: evaluationData, // Store detailed data for advanced feedback
    }

    hasAttempted.value = true
    isProcessing.value = false
  } catch (error) {
    console.error('Error processing speech:', error)

    // Fallback to encouraging message
    lastAttempt.value = {
      score: 75,
      feedback: 'Unable to analyze your pronunciation right now. Keep practicing!',
      recordingUrl: audioUrl,
    }

    hasAttempted.value = true
    isProcessing.value = false
  }
}

const generateFeedback = (evaluationData: SpeechEvaluationData): string => {
  if (!evaluationData.words || evaluationData.words.length === 0) {
    return 'Good attempt! Keep practicing your pronunciation.'
  }

  const words = evaluationData.words
  const lowScoringWords = words.filter((word: WordScore) => word.scores.pronunciation < 80)
  const toneIssues = words.filter((word: WordScore) => word.scores.tone && word.scores.tone < 80)

  let feedback = ''

  if (lowScoringWords.length === 0) {
    feedback = 'Excellent pronunciation! Your speech is very clear.'
  } else if (lowScoringWords.length === words.length) {
    feedback = 'Keep practicing! Focus on pronouncing each syllable clearly.'
  } else {
    const problemWords = lowScoringWords.map((word: WordScore) => word.word).join(', ')
    feedback = `Good effort! Pay attention to the pronunciation of: ${problemWords}`
  }

  if (toneIssues.length > 0) {
    feedback += ' Also work on your tone accuracy - tones are very important in Chinese!'
  }

  return feedback
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
  isClickToggleMode.value = false
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'fair'
  return 'needs-work'
}

const getWordScoreClass = (pronunciationScore: number) => {
  if (pronunciationScore >= 90) return 'word-excellent'
  if (pronunciationScore >= 80) return 'word-good'
  if (pronunciationScore >= 70) return 'word-fair'
  return 'word-needs-work'
}

const getWordIssues = (word: WordScore) => {
  const issues = []

  if (word.read_type === 1) {
    issues.push('Extra word')
  } else if (word.read_type === 2) {
    issues.push('Missing word')
  }

  if (word.scores.pronunciation < 70) {
    issues.push('Pronunciation')
  }

  if (word.scores.tone && word.scores.tone < 70) {
    issues.push('Tone')
  }

  return issues
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

.word-analysis {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.analysis-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a202c;
}

.word-scores {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.word-score-item {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  min-width: 120px;
  text-align: center;
  transition: all 0.3s ease;
}

.word-score-item.word-excellent {
  border-color: #10b981;
  background: #ecfdf5;
}

.word-score-item.word-good {
  border-color: #3b82f6;
  background: #eff6ff;
}

.word-score-item.word-fair {
  border-color: #f59e0b;
  background: #fffbeb;
}

.word-score-item.word-needs-work {
  border-color: #ef4444;
  background: #fef2f2;
}

.word-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.word-pinyin {
  font-size: 0.875rem;
  color: #667eea;
  font-style: italic;
  margin-bottom: 0.5rem;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.score-label {
  font-weight: 500;
  color: #6b7280;
}

.score-value {
  font-weight: 600;
  color: #1a202c;
}

.word-issues {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.issue-tag {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
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
