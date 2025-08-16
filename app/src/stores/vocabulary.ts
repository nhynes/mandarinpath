import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Word {
  id: string
  chinese: string
  pinyin?: string
  definition: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  addedDate: Date
  lastReviewed?: Date
  nextReview?: Date
  strength: number // 0-100, how well the user knows this word
  correctAttempts: number
  totalAttempts: number
  tasks: {
    speaking: {
      completed: boolean
      lastScore?: number
      attempts: number
    }
    reading: {
      completed: boolean
      timesEncountered: number
    }
    writing: {
      completed: boolean
      lastScore?: number
      attempts: number
    }
  }
}

export interface WordDefinition {
  partOfSpeech: string
  meaning: string
}

export interface WordInfo extends Word {
  definitions: WordDefinition[]
  examples?: {
    chinese: string
    pinyin: string
    english: string
  }[]
}

export const useVocabularyStore = defineStore('vocabulary', () => {
  const words = ref<Word[]>([
    {
      id: '1',
      chinese: '你好',
      pinyin: 'nǐ hǎo',
      definition: 'hello',
      difficulty: 'beginner',
      addedDate: new Date('2024-01-15'),
      lastReviewed: new Date('2024-01-20'),
      strength: 85,
      correctAttempts: 8,
      totalAttempts: 10,
      tasks: {
        speaking: { completed: true, lastScore: 92, attempts: 3 },
        reading: { completed: true, timesEncountered: 15 },
        writing: { completed: true, lastScore: 88, attempts: 2 },
      },
    },
    {
      id: '2',
      chinese: '谢谢',
      pinyin: 'xiè xiè',
      definition: 'thank you',
      difficulty: 'beginner',
      addedDate: new Date('2024-01-16'),
      lastReviewed: new Date('2024-01-21'),
      strength: 78,
      correctAttempts: 7,
      totalAttempts: 9,
      tasks: {
        speaking: { completed: true, lastScore: 85, attempts: 2 },
        reading: { completed: true, timesEncountered: 12 },
        writing: { completed: false, attempts: 1 },
      },
    },
    {
      id: '3',
      chinese: '学习',
      pinyin: 'xué xí',
      definition: 'to study/learn',
      difficulty: 'intermediate',
      addedDate: new Date('2024-01-18'),
      strength: 45,
      correctAttempts: 3,
      totalAttempts: 7,
      tasks: {
        speaking: { completed: false, attempts: 2 },
        reading: { completed: false, timesEncountered: 5 },
        writing: { completed: false, attempts: 0 },
      },
    },
  ])

  const wordDatabase = ref<{ [key: string]: WordInfo }>({
    你好: {
      id: '1',
      chinese: '你好',
      pinyin: 'nǐ hǎo',
      definition: 'hello',
      difficulty: 'beginner',
      addedDate: new Date('2024-01-15'),
      strength: 85,
      correctAttempts: 8,
      totalAttempts: 10,
      tasks: {
        speaking: { completed: true, lastScore: 92, attempts: 3 },
        reading: { completed: true, timesEncountered: 15 },
        writing: { completed: true, lastScore: 88, attempts: 2 },
      },
      definitions: [{ partOfSpeech: 'greeting', meaning: 'hello; hi' }],
      examples: [
        {
          chinese: '你好，我叫小明。',
          pinyin: 'Nǐ hǎo, wǒ jiào Xiǎo Míng.',
          english: 'Hello, my name is Xiao Ming.',
        },
      ],
    },
  })

  // Computed properties
  const totalWords = computed(() => words.value.length)

  const wordsByDifficulty = computed(() => ({
    beginner: words.value.filter((w) => w.difficulty === 'beginner').length,
    intermediate: words.value.filter((w) => w.difficulty === 'intermediate').length,
    advanced: words.value.filter((w) => w.difficulty === 'advanced').length,
  }))

  const wordsReadyForReview = computed(() => {
    const now = new Date()
    return words.value.filter((word) => !word.nextReview || word.nextReview <= now)
  })

  const taskStats = computed(() => ({
    speaking: {
      ready: words.value.filter((w) => !w.tasks.speaking.completed).length,
      completed: words.value.filter((w) => w.tasks.speaking.completed).length,
    },
    reading: {
      ready: 3, // Stories available
      completed: words.value.filter((w) => w.tasks.reading.completed).length,
    },
    writing: {
      ready: words.value.filter((w) => !w.tasks.writing.completed).length,
      completed: words.value.filter((w) => w.tasks.writing.completed).length,
    },
  }))

  const weakWords = computed(() => words.value.filter((word) => word.strength < 60))

  // Actions
  function addWord(
    wordData: Omit<
      Word,
      'id' | 'addedDate' | 'strength' | 'correctAttempts' | 'totalAttempts' | 'tasks'
    >,
  ) {
    const newWord: Word = {
      ...wordData,
      id: Date.now().toString(),
      addedDate: new Date(),
      strength: 0,
      correctAttempts: 0,
      totalAttempts: 0,
      tasks: {
        speaking: { completed: false, attempts: 0 },
        reading: { completed: false, timesEncountered: 0 },
        writing: { completed: false, attempts: 0 },
      },
    }
    words.value.push(newWord)
    return newWord
  }

  function addWords(
    wordsData: Array<
      Omit<Word, 'id' | 'addedDate' | 'strength' | 'correctAttempts' | 'totalAttempts' | 'tasks'>
    >,
  ) {
    const newWords = wordsData.map((wordData) => addWord(wordData))
    return newWords
  }

  function updateWordStrength(
    wordId: string,
    correct: boolean,
    taskType: 'speaking' | 'reading' | 'writing',
  ) {
    const word = words.value.find((w) => w.id === wordId)
    if (!word) return

    word.totalAttempts++
    if (correct) {
      word.correctAttempts++
      word.strength = Math.min(100, word.strength + 10)
    } else {
      word.strength = Math.max(0, word.strength - 5)
    }

    word.lastReviewed = new Date()

    // Update task-specific stats
    if (taskType === 'speaking' || taskType === 'writing') {
      word.tasks[taskType].attempts++
    } else if (taskType === 'reading') {
      word.tasks[taskType].timesEncountered++
    }

    // Calculate next review date based on strength
    const daysUntilReview = Math.floor(word.strength / 10) + 1
    word.nextReview = new Date(Date.now() + daysUntilReview * 24 * 60 * 60 * 1000)
  }

  function completeTask(
    wordId: string,
    taskType: 'speaking' | 'reading' | 'writing',
    score?: number,
  ) {
    const word = words.value.find((w) => w.id === wordId)
    if (!word) return

    word.tasks[taskType].completed = true
    if (score !== undefined && (taskType === 'speaking' || taskType === 'writing')) {
      word.tasks[taskType].lastScore = score
    }

    updateWordStrength(wordId, score ? score >= 70 : true, taskType)
  }

  function getWordInfo(chinese: string): WordInfo | undefined {
    return wordDatabase.value[chinese]
  }

  function searchWords(query: string) {
    const lowerQuery = query.toLowerCase()
    return words.value.filter(
      (word) =>
        word.chinese.includes(query) ||
        word.pinyin?.toLowerCase().includes(lowerQuery) ||
        word.definition.toLowerCase().includes(lowerQuery),
    )
  }

  function getWordsForTask(taskType: 'speaking' | 'reading' | 'writing', limit: number = 10) {
    return words.value
      .filter((word) => !word.tasks[taskType].completed)
      .sort((a, b) => {
        // Prioritize words that haven't been attempted
        const aAttempts =
          taskType === 'reading' ? a.tasks[taskType].timesEncountered : a.tasks[taskType].attempts
        const bAttempts =
          taskType === 'reading' ? b.tasks[taskType].timesEncountered : b.tasks[taskType].attempts

        if (aAttempts === 0 && bAttempts > 0) return -1
        if (bAttempts === 0 && aAttempts > 0) return 1

        // Then by strength (weaker words first)
        return a.strength - b.strength
      })
      .slice(0, limit)
  }

  function removeWord(wordId: string) {
    const index = words.value.findIndex((w) => w.id === wordId)
    if (index !== -1) {
      words.value.splice(index, 1)
    }
  }

  return {
    words,
    wordDatabase,
    totalWords,
    wordsByDifficulty,
    wordsReadyForReview,
    taskStats,
    weakWords,
    addWord,
    addWords,
    updateWordStrength,
    completeTask,
    getWordInfo,
    searchWords,
    getWordsForTask,
    removeWord,
  }
})
