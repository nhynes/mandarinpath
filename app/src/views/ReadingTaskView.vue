<template>
  <PageLayout>
    <div class="reading-content">
      <div class="task-header">
        <button @click="$router.go(-1)" class="back-button">← Back</button>
        <h1 class="task-title">Reading Practice</h1>
        <div class="reading-controls">
          <button @click="togglePinyin" class="toggle-button" :class="{ active: showPinyin }">
            拼音
          </button>
          <button
            @click="toggleTranslation"
            class="toggle-button"
            :class="{ active: showTranslation }"
          >
            Translation
          </button>
        </div>
      </div>

      <div class="reading-layout">
        <div class="dictionary-panel" :class="{ expanded: selectedWord }">
          <div class="dictionary-header">
            <h3 class="dictionary-title">Dictionary</h3>
            <button v-if="selectedWord" @click="clearSelection" class="clear-button">×</button>
          </div>

          <div v-if="selectedWord" class="word-details">
            <div class="word-main">
              <div class="word-chinese">{{ selectedWord.chinese }}</div>
              <div class="word-pinyin">{{ selectedWord.pinyin }}</div>
            </div>

            <div class="word-definitions">
              <div
                v-for="(def, index) in selectedWord.definitions"
                :key="index"
                class="definition-item"
              >
                <span class="part-of-speech">{{ def.partOfSpeech }}</span>
                <span class="definition-text">{{ def.meaning }}</span>
              </div>
            </div>

            <div class="word-examples" v-if="selectedWord.examples">
              <h4 class="examples-title">Examples:</h4>
              <div
                v-for="(example, index) in selectedWord.examples"
                :key="index"
                class="example-item"
              >
                <div class="example-chinese">{{ example.chinese }}</div>
                <div class="example-pinyin" v-if="showPinyin">{{ example.pinyin }}</div>
                <div class="example-english">{{ example.english }}</div>
              </div>
            </div>

            <div class="word-actions">
              <button @click="playPronunciation" class="action-button">🔊 Listen</button>
              <button @click="addToStudyList" class="action-button">📚 Add to Study</button>
            </div>
          </div>

          <div v-else class="dictionary-placeholder">
            <p>Click on any word in the text to see its definition</p>
          </div>
        </div>

        <div class="reader-panel">
          <div class="story-header">
            <h2 class="story-title">{{ currentStory.title }}</h2>
            <div class="story-meta">
              <span class="difficulty-badge" :class="currentStory.difficulty">
                {{ currentStory.difficulty.toUpperCase() }}
              </span>
              <span class="word-count">{{ currentStory.wordCount }} characters</span>
            </div>
          </div>

          <div class="story-content">
            <div class="story-text">
              <p
                v-for="(paragraph, pIndex) in currentStory.paragraphs"
                :key="pIndex"
                class="story-paragraph"
              >
                <span
                  v-for="(word, wIndex) in paragraph.words"
                  :key="wIndex"
                  @click="selectWord(word)"
                  class="clickable-word"
                  :class="{
                    selected: selectedWord?.chinese === word.chinese,
                    known: word.isKnown,
                    learning: word.isLearning,
                  }"
                  >{{ word.chinese }}</span
                >
              </p>
            </div>

            <div v-if="showPinyin" class="story-pinyin">
              <p
                v-for="(paragraph, pIndex) in currentStory.paragraphs"
                :key="pIndex"
                class="pinyin-paragraph"
              >
                <span v-for="(word, wIndex) in paragraph.words" :key="wIndex" class="pinyin-word">{{
                  word.pinyin
                }}</span>
              </p>
            </div>

            <div v-if="showTranslation" class="story-translation">
              <p
                v-for="(paragraph, pIndex) in currentStory.paragraphs"
                :key="pIndex"
                class="translation-paragraph"
              >
                {{ paragraph.translation }}
              </p>
            </div>
          </div>

          <div class="story-actions">
            <button @click="markAsRead" class="complete-button">Mark as Read</button>
            <button @click="nextStory" class="next-button">Next Story</button>
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

interface WordInfo {
  chinese: string
  pinyin: string
  definitions: {
    partOfSpeech: string
    meaning: string
  }[]
  examples?: {
    chinese: string
    pinyin: string
    english: string
  }[]
  isKnown?: boolean
  isLearning?: boolean
}

interface StoryWord {
  chinese: string
  pinyin: string
  isKnown?: boolean
  isLearning?: boolean
}

interface StoryParagraph {
  words: StoryWord[]
  translation: string
}

interface Story {
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  wordCount: number
  paragraphs: StoryParagraph[]
}

const router = useRouter()

const showPinyin = ref(false)
const showTranslation = ref(false)
const selectedWord = ref<WordInfo | null>(null)

const currentStory = reactive<Story>({
  title: '小明的一天',
  difficulty: 'beginner',
  wordCount: 156,
  paragraphs: [
    {
      words: [
        { chinese: '小明', pinyin: 'Xiǎo Míng', isKnown: true },
        { chinese: '是', pinyin: 'shì', isKnown: true },
        { chinese: '一个', pinyin: 'yí gè', isKnown: true },
        { chinese: '学生', pinyin: 'xué shēng', isLearning: true },
        { chinese: '。', pinyin: '。', isKnown: true },
        { chinese: '他', pinyin: 'tā', isKnown: true },
        { chinese: '每天', pinyin: 'měi tiān', isLearning: true },
        { chinese: '早上', pinyin: 'zǎo shang', isKnown: true },
        { chinese: '七点', pinyin: 'qī diǎn', isKnown: true },
        { chinese: '起床', pinyin: 'qǐ chuáng', isLearning: true },
        { chinese: '。', pinyin: '。', isKnown: true },
      ],
      translation: "Xiao Ming is a student. He gets up at seven o'clock every morning.",
    },
    {
      words: [
        { chinese: '起床', pinyin: 'qǐ chuáng', isLearning: true },
        { chinese: '以后', pinyin: 'yǐ hòu' },
        { chinese: '，', pinyin: '，', isKnown: true },
        { chinese: '他', pinyin: 'tā', isKnown: true },
        { chinese: '先', pinyin: 'xiān' },
        { chinese: '刷牙', pinyin: 'shuā yá' },
        { chinese: '，', pinyin: '，', isKnown: true },
        { chinese: '然后', pinyin: 'rán hòu' },
        { chinese: '吃', pinyin: 'chī', isKnown: true },
        { chinese: '早饭', pinyin: 'zǎo fàn' },
        { chinese: '。', pinyin: '。', isKnown: true },
      ],
      translation: 'After getting up, he first brushes his teeth, then eats breakfast.',
    },
  ],
})

const wordDatabase: { [key: string]: WordInfo } = {
  学生: {
    chinese: '学生',
    pinyin: 'xué shēng',
    definitions: [{ partOfSpeech: 'noun', meaning: 'student; pupil' }],
    examples: [
      {
        chinese: '我是一个学生。',
        pinyin: 'Wǒ shì yí gè xué shēng.',
        english: 'I am a student.',
      },
    ],
  },
  每天: {
    chinese: '每天',
    pinyin: 'měi tiān',
    definitions: [{ partOfSpeech: 'adverb', meaning: 'every day; daily' }],
    examples: [
      {
        chinese: '我每天学习中文。',
        pinyin: 'Wǒ měi tiān xué xí zhōng wén.',
        english: 'I study Chinese every day.',
      },
    ],
  },
  起床: {
    chinese: '起床',
    pinyin: 'qǐ chuáng',
    definitions: [{ partOfSpeech: 'verb', meaning: 'to get up; to rise from bed' }],
    examples: [
      {
        chinese: '他每天六点起床。',
        pinyin: 'Tā měi tiān liù diǎn qǐ chuáng.',
        english: "He gets up at six o'clock every day.",
      },
    ],
  },
  以后: {
    chinese: '以后',
    pinyin: 'yǐ hòu',
    definitions: [{ partOfSpeech: 'noun', meaning: 'later; afterwards; in the future' }],
  },
  先: {
    chinese: '先',
    pinyin: 'xiān',
    definitions: [{ partOfSpeech: 'adverb', meaning: 'first; before; earlier' }],
  },
  刷牙: {
    chinese: '刷牙',
    pinyin: 'shuā yá',
    definitions: [{ partOfSpeech: 'verb', meaning: 'to brush teeth' }],
  },
  然后: {
    chinese: '然后',
    pinyin: 'rán hòu',
    definitions: [{ partOfSpeech: 'adverb', meaning: 'then; after that; afterwards' }],
  },
  早饭: {
    chinese: '早饭',
    pinyin: 'zǎo fàn',
    definitions: [{ partOfSpeech: 'noun', meaning: 'breakfast' }],
  },
}

const selectWord = (word: StoryWord) => {
  const wordInfo = wordDatabase[word.chinese]
  if (wordInfo) {
    selectedWord.value = wordInfo
  } else {
    selectedWord.value = {
      chinese: word.chinese,
      pinyin: word.pinyin,
      definitions: [{ partOfSpeech: 'unknown', meaning: 'Definition not available' }],
    }
  }
}

const clearSelection = () => {
  selectedWord.value = null
}

const togglePinyin = () => {
  showPinyin.value = !showPinyin.value
}

const toggleTranslation = () => {
  showTranslation.value = !showTranslation.value
}

const playPronunciation = () => {
  if (selectedWord.value) {
    const utterance = new SpeechSynthesisUtterance(selectedWord.value.chinese)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.7
    speechSynthesis.speak(utterance)
  }
}

const addToStudyList = () => {
  if (selectedWord.value) {
    alert(`Added "${selectedWord.value.chinese}" to your study list!`)
  }
}

const markAsRead = () => {
  alert('Story marked as read! Great job!')
  router.push('/')
}

const nextStory = () => {
  alert('Loading next story...')
}
</script>

<style scoped>
.reading-content {
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

.reading-controls {
  display: flex;
  gap: 0.5rem;
}

.toggle-button {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.reading-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  height: calc(100vh - 200px);
}

.dictionary-panel {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow-y: auto;
}

.dictionary-panel.expanded {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dictionary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dictionary-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
}

.clear-button {
  background: #ef4444;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
}

.word-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.word-main {
  text-align: center;
}

.word-chinese {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.word-pinyin {
  font-size: 1.125rem;
  color: #667eea;
  font-style: italic;
}

.word-definitions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.definition-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.part-of-speech {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
}

.definition-text {
  color: #374151;
  line-height: 1.5;
}

.word-examples {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.examples-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #4b5563;
}

.example-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.example-chinese {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.example-pinyin {
  font-size: 0.875rem;
  color: #667eea;
  margin-bottom: 0.25rem;
  font-style: italic;
}

.example-english {
  font-size: 0.875rem;
  color: #4b5563;
}

.word-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  flex: 1;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.dictionary-placeholder {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  margin-top: 2rem;
}

.reader-panel {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow-y: auto;
}

.story-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.story-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.75rem 0;
}

.story-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.difficulty-badge.beginner {
  background: #10b981;
}

.difficulty-badge.intermediate {
  background: #f59e0b;
}

.difficulty-badge.advanced {
  background: #ef4444;
}

.word-count {
  color: #6b7280;
  font-size: 0.875rem;
}

.story-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.story-text {
  line-height: 2;
  font-size: 1.125rem;
}

.story-paragraph {
  margin-bottom: 1rem;
}

.clickable-word {
  cursor: pointer;
  padding: 2px 1px;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.clickable-word:hover {
  background: #f3f4f6;
}

.clickable-word.selected {
  background: #667eea;
  color: white;
}

.clickable-word.known {
  color: #10b981;
  font-weight: 500;
}

.clickable-word.learning {
  color: #f59e0b;
  font-weight: 500;
}

.story-pinyin {
  color: #667eea;
  line-height: 2;
  font-style: italic;
}

.pinyin-paragraph {
  margin-bottom: 1rem;
}

.pinyin-word {
  margin-right: 0.25rem;
}

.story-translation {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.translation-paragraph {
  margin-bottom: 0.75rem;
  color: #4b5563;
  line-height: 1.6;
}

.story-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.complete-button,
.next-button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.complete-button {
  background: #10b981;
  color: white;
}

.next-button {
  background: #667eea;
  color: white;
}

@media (max-width: 1024px) {
  .reading-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .dictionary-panel {
    order: 2;
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
    gap: 1rem;
  }

  .story-actions {
    flex-direction: column;
  }
}
</style>
