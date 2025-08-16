<template>
  <PageLayout>
    <div class="loading-content">
      <h1 class="page-title">Load Words</h1>

      <div class="loading-section">
        <div
          class="upload-area"
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleFileDrop"
        >
          <div class="upload-content">
            <div class="upload-icon">📚</div>
            <h3 class="upload-title">Add New Words</h3>
            <p class="upload-description">Drop a text file here or click to browse</p>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept=".txt,.csv"
              class="file-input"
            />
            <button class="upload-button" @click="triggerFileSelect">Choose File</button>
          </div>
        </div>

        <div class="format-info">
          <h4 class="info-title">Supported Formats</h4>
          <ul class="format-list">
            <li>Text files (.txt) - one word per line</li>
            <li>CSV files (.csv) - word, pinyin, definition format</li>
            <li>Example: 你好, nǐ hǎo, hello</li>
          </ul>
        </div>

        <div class="manual-input">
          <h4 class="input-title">Add Individual Words</h4>
          <form @submit.prevent="addWord" class="word-form">
            <div class="form-row">
              <input
                type="text"
                v-model="newWord.chinese"
                placeholder="Chinese character"
                class="form-input"
                required
              />
              <input
                type="text"
                v-model="newWord.pinyin"
                placeholder="Pinyin (optional)"
                class="form-input"
              />
              <input
                type="text"
                v-model="newWord.definition"
                placeholder="Definition"
                class="form-input"
                required
              />
              <button type="submit" class="add-button">Add</button>
            </div>
          </form>
        </div>

        <div class="word-list" v-if="loadedWords.length > 0">
          <h4 class="list-title">Loaded Words ({{ loadedWords.length }})</h4>
          <div class="word-grid">
            <div v-for="(word, index) in loadedWords" :key="index" class="word-card">
              <div class="word-chinese">{{ word.chinese }}</div>
              <div class="word-pinyin" v-if="word.pinyin">{{ word.pinyin }}</div>
              <div class="word-definition">{{ word.definition }}</div>
              <button @click="removeWord(index)" class="remove-button">×</button>
            </div>
          </div>
          <div class="actions">
            <button @click="saveWords" class="save-button" :disabled="loadedWords.length === 0">
              Save {{ loadedWords.length }} Words
            </button>
            <button @click="clearWords" class="clear-button">Clear All</button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import PageLayout from '../components/PageLayout.vue'

interface Word {
  chinese: string
  pinyin?: string
  definition: string
}

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const loadedWords = ref<Word[]>([])

const newWord = reactive<Word>({
  chinese: '',
  pinyin: '',
  definition: '',
})

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file: File) => {
  const text = await file.text()
  const lines = text.split('\n').filter((line) => line.trim())

  const words: Word[] = []

  for (const line of lines) {
    if (file.name.endsWith('.csv')) {
      const parts = line.split(',').map((part) => part.trim())
      if (parts.length >= 2) {
        words.push({
          chinese: parts[0],
          pinyin: parts[1] || undefined,
          definition: parts[2] || parts[1],
        })
      }
    } else {
      words.push({
        chinese: line.trim(),
        definition: 'Definition needed',
      })
    }
  }

  loadedWords.value.push(...words)
}

const addWord = () => {
  if (newWord.chinese && newWord.definition) {
    loadedWords.value.push({
      chinese: newWord.chinese,
      pinyin: newWord.pinyin || undefined,
      definition: newWord.definition,
    })

    newWord.chinese = ''
    newWord.pinyin = ''
    newWord.definition = ''
  }
}

const removeWord = (index: number) => {
  loadedWords.value.splice(index, 1)
}

const clearWords = () => {
  loadedWords.value = []
}

const saveWords = () => {
  alert(`Saved ${loadedWords.value.length} words to your learning deck!`)
  loadedWords.value = []
}
</script>

<style scoped>
.loading-content {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #1a202c;
}

.loading-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.upload-area {
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area.drag-over {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.upload-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
}

.upload-description {
  margin: 0;
  color: #64748b;
}

.file-input {
  display: none;
}

.upload-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.upload-button:hover {
  background: #5a6fd8;
}

.format-info {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.format-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #4b5563;
}

.format-list li {
  margin-bottom: 0.5rem;
}

.manual-input {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.input-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.word-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr auto;
  gap: 0.75rem;
  align-items: center;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.add-button:hover {
  background: #059669;
}

.word-list {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.list-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.word-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.word-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  position: relative;
}

.word-chinese {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.word-pinyin {
  font-size: 0.875rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.word-definition {
  font-size: 0.875rem;
  color: #4b5563;
}

.remove-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.save-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.clear-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

@media (max-width: 768px) {
  .word-form .form-row {
    grid-template-columns: 1fr;
  }

  .word-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
