<template>
  <PageLayout>
    <div class="drawing-content">
      <div class="task-header">
        <button @click="$router.go(-1)" class="back-button">← Back</button>
        <h1 class="task-title">Character Writing</h1>
        <div class="progress-indicator">
          <span class="current-char">{{ currentCharIndex + 1 }}</span> /
          <span class="total-chars">{{ characters.length }}</span>
        </div>
      </div>

      <div class="drawing-layout">
        <div class="character-info">
          <div class="target-character">
            <div class="character-display">{{ currentCharacter.character }}</div>
            <div class="character-pinyin">{{ currentCharacter.pinyin }}</div>
            <div class="character-meaning">{{ currentCharacter.meaning }}</div>
          </div>

          <div class="stroke-info">
            <div class="stroke-count">
              <span class="label">Strokes:</span>
              <span class="count">{{ currentCharacter.strokes }}</span>
            </div>
            <div class="stroke-order-controls">
              <button @click="showStrokeOrder" class="stroke-button">📝 Show Stroke Order</button>
              <button @click="playStrokeAnimation" class="stroke-button" :disabled="isAnimating">
                ▶️ {{ isAnimating ? 'Playing...' : 'Animate' }}
              </button>
            </div>
          </div>

          <div class="practice-controls">
            <div class="control-group">
              <label for="showGrid" class="control-label">
                <input type="checkbox" id="showGrid" v-model="showGrid" />
                Show Grid
              </label>
              <label for="showGuide" class="control-label">
                <input type="checkbox" id="showGuide" v-model="showGuide" />
                Show Guide
              </label>
            </div>
            <div class="control-actions">
              <button @click="clearCanvas" class="action-button clear">🗑️ Clear</button>
              <button
                @click="undoStroke"
                class="action-button undo"
                :disabled="strokes.length === 0"
              >
                ↶ Undo
              </button>
            </div>
          </div>
        </div>

        <div class="drawing-area">
          <div class="canvas-container" ref="canvasContainer">
            <canvas
              ref="guideCanvas"
              class="guide-canvas"
              :width="canvasSize"
              :height="canvasSize"
            ></canvas>
            <canvas
              ref="drawingCanvas"
              class="drawing-canvas"
              :width="canvasSize"
              :height="canvasSize"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @touchstart="startDrawing"
              @touchmove="draw"
              @touchend="stopDrawing"
            ></canvas>
          </div>

          <div class="drawing-feedback" v-if="lastAttempt">
            <div class="feedback-header">
              <h3 class="feedback-title">Writing Analysis</h3>
              <div class="score" :class="getScoreClass(lastAttempt.score)">
                {{ lastAttempt.score }}%
              </div>
            </div>
            <div class="feedback-content">
              <p class="feedback-text">{{ lastAttempt.feedback }}</p>
              <div class="stroke-analysis" v-if="lastAttempt.strokeAnalysis">
                <div
                  class="analysis-item"
                  v-for="(analysis, index) in lastAttempt.strokeAnalysis"
                  :key="index"
                >
                  <span class="stroke-number">Stroke {{ index + 1 }}:</span>
                  <span class="stroke-feedback" :class="analysis.quality">
                    {{ analysis.comment }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="task-actions">
        <button @click="skipCharacter" class="skip-button">Skip Character</button>
        <button
          @click="checkWriting"
          class="check-button"
          :disabled="strokes.length === 0 || isChecking"
        >
          {{ isChecking ? 'Checking...' : 'Check Writing' }}
        </button>
        <button @click="nextCharacter" class="next-button" :disabled="!hasAttempted">
          Next Character
        </button>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'

interface Character {
  character: string
  pinyin: string
  meaning: string
  strokes: number
  strokeOrder?: string[]
}

interface Stroke {
  points: { x: number; y: number }[]
  width: number
}

interface StrokeAnalysis {
  quality: 'good' | 'fair' | 'poor'
  comment: string
}

interface Attempt {
  score: number
  feedback: string
  strokeAnalysis?: StrokeAnalysis[]
}

const router = useRouter()

const characters = ref<Character[]>([
  { character: '人', pinyin: 'rén', meaning: 'person', strokes: 2 },
  { character: '大', pinyin: 'dà', meaning: 'big', strokes: 3 },
  { character: '小', pinyin: 'xiǎo', meaning: 'small', strokes: 3 },
  { character: '山', pinyin: 'shān', meaning: 'mountain', strokes: 3 },
  { character: '水', pinyin: 'shuǐ', meaning: 'water', strokes: 4 },
])

const currentCharIndex = ref(0)
const canvasSize = ref(400)
const showGrid = ref(true)
const showGuide = ref(true)
const isDrawing = ref(false)
const isAnimating = ref(false)
const isChecking = ref(false)
const hasAttempted = ref(false)

const strokes = ref<Stroke[]>([])
const currentStroke = ref<Stroke | null>(null)
const lastAttempt = ref<Attempt | null>(null)

const canvasContainer = ref<HTMLDivElement>()
const drawingCanvas = ref<HTMLCanvasElement>()
const guideCanvas = ref<HTMLCanvasElement>()

const currentCharacter = computed(() => characters.value[currentCharIndex.value])

onMounted(() => {
  nextTick(() => {
    setupCanvases()
    drawGuides()
  })
})

const setupCanvases = () => {
  if (!canvasContainer.value) return

  const containerWidth = canvasContainer.value.clientWidth
  const size = Math.min(containerWidth - 40, 400)
  canvasSize.value = size

  nextTick(() => {
    drawGuides()
  })
}

const drawGuides = () => {
  const canvas = guideCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (showGrid.value) {
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    const quarterSize = canvas.width / 4
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(i * quarterSize, 0)
      ctx.lineTo(i * quarterSize, canvas.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * quarterSize)
      ctx.lineTo(canvas.width, i * quarterSize)
      ctx.stroke()
    }

    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }

  if (showGuide.value) {
    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)'
    ctx.font = `${canvas.width * 0.7}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(currentCharacter.value.character, canvas.width / 2, canvas.height / 2)
  }
}

const getCanvasPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
  const canvas = drawingCanvas.value
  if (!canvas) return { x: 0, y: 0 }

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  let clientX: number, clientY: number

  if (e instanceof MouseEvent) {
    clientX = e.clientX
    clientY = e.clientY
  } else {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

const startDrawing = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  isDrawing.value = true

  const pos = getCanvasPos(e)
  currentStroke.value = {
    points: [pos],
    width: 8,
  }
}

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !currentStroke.value) return

  e.preventDefault()
  const pos = getCanvasPos(e)
  currentStroke.value.points.push(pos)

  redrawCanvas()
}

const stopDrawing = () => {
  if (!isDrawing.value || !currentStroke.value) return

  isDrawing.value = false
  strokes.value.push(currentStroke.value)
  currentStroke.value = null
}

const redrawCanvas = () => {
  const canvas = drawingCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const allStrokes = [...strokes.value]
  if (currentStroke.value) {
    allStrokes.push(currentStroke.value)
  }

  allStrokes.forEach((stroke) => {
    if (stroke.points.length < 2) return

    ctx.strokeStyle = '#1a202c'
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }

    ctx.stroke()
  })
}

const clearCanvas = () => {
  strokes.value = []
  currentStroke.value = null
  lastAttempt.value = null
  hasAttempted.value = false
  redrawCanvas()
}

const undoStroke = () => {
  if (strokes.value.length > 0) {
    strokes.value.pop()
    redrawCanvas()
  }
}

const showStrokeOrder = () => {
  alert(
    `Stroke order guide for ${currentCharacter.value.character} - This would show detailed stroke order instructions.`,
  )
}

const playStrokeAnimation = () => {
  isAnimating.value = true
  alert(`Playing stroke animation for ${currentCharacter.value.character}...`)

  setTimeout(() => {
    isAnimating.value = false
  }, 3000)
}

const checkWriting = () => {
  isChecking.value = true

  setTimeout(() => {
    const scores = [78, 85, 92, 88, 95]
    const feedbacks = [
      'Good attempt! Work on stroke proportions.',
      'Nice writing! Your strokes are well-balanced.',
      'Excellent! Very close to the standard form.',
      'Good effort. Pay attention to stroke order.',
      'Perfect! Your character looks authentic.',
    ]

    const strokeAnalyses = [
      [
        { quality: 'good' as const, comment: 'Good direction and length' },
        { quality: 'fair' as const, comment: 'Could be more curved' },
      ],
      [
        { quality: 'good' as const, comment: 'Excellent stroke' },
        { quality: 'good' as const, comment: 'Perfect angle' },
        { quality: 'fair' as const, comment: 'Slightly too thick' },
      ],
    ]

    const randomIndex = Math.floor(Math.random() * scores.length)

    lastAttempt.value = {
      score: scores[randomIndex],
      feedback: feedbacks[randomIndex],
      strokeAnalysis: strokeAnalyses[Math.floor(Math.random() * strokeAnalyses.length)],
    }

    hasAttempted.value = true
    isChecking.value = false
  }, 2000)
}

const skipCharacter = () => {
  nextCharacter()
}

const nextCharacter = () => {
  if (currentCharIndex.value < characters.value.length - 1) {
    currentCharIndex.value++
    resetCurrentCharacter()
  } else {
    alert("Congratulations! You've completed all writing practice.")
    router.push('/')
  }
}

const resetCurrentCharacter = () => {
  clearCanvas()
  drawGuides()
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'fair'
  return 'needs-work'
}

// Watch for changes to redraw guides
const watchGuides = () => {
  drawGuides()
}

// Set up watchers for grid and guide visibility
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (showGrid.value || showGuide.value) {
      watchGuides()
    }
  }, 100)
}
</script>

<style scoped>
.drawing-content {
  width: 100%;
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

.drawing-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.character-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.target-character {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.character-display {
  font-size: 4rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
  line-height: 1;
}

.character-pinyin {
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.character-meaning {
  font-size: 1.125rem;
  color: #4b5563;
}

.stroke-info {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.stroke-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.label {
  color: #4b5563;
  font-weight: 500;
}

.count {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
}

.stroke-order-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stroke-button {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.stroke-button:hover:not(:disabled) {
  background: #7c3aed;
}

.stroke-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.practice-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.control-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.control-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  flex: 1;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.action-button.clear {
  background: #ef4444;
  color: white;
}

.action-button.undo {
  background: #6b7280;
  color: white;
}

.action-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.drawing-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.canvas-container {
  position: relative;
  display: flex;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.guide-canvas,
.drawing-canvas {
  position: absolute;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: white;
}

.drawing-canvas {
  cursor: crosshair;
  z-index: 10;
}

.drawing-feedback {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.stroke-analysis {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.analysis-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
}

.stroke-number {
  font-weight: 600;
  color: #4b5563;
  min-width: 80px;
}

.stroke-feedback.good {
  color: #10b981;
}

.stroke-feedback.fair {
  color: #f59e0b;
}

.stroke-feedback.poor {
  color: #ef4444;
}

.task-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.skip-button,
.check-button,
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

.check-button {
  background: #f59e0b;
  color: white;
}

.next-button {
  background: #10b981;
  color: white;
}

.check-button:disabled,
.next-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .drawing-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .character-info {
    order: 2;
  }
}

@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .task-actions {
    flex-direction: column;
  }

  .control-actions {
    flex-direction: column;
  }
}
</style>
