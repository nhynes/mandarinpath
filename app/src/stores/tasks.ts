import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface TaskSession {
  id: string
  type: 'speaking' | 'reading' | 'writing'
  startTime: Date
  endTime?: Date
  wordsCompleted: string[]
  totalWords: number
  averageScore?: number
  completed: boolean
}

export interface Story {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  wordCount: number
  paragraphs: StoryParagraph[]
  completed: boolean
  completedAt?: Date
}

export interface StoryParagraph {
  words: StoryWord[]
  translation: string
}

export interface StoryWord {
  chinese: string
  pinyin: string
  isKnown?: boolean
  isLearning?: boolean
}

export interface Character {
  chinese: string
  pinyin: string
  meaning: string
  strokes: number
  strokeOrder?: string[]
  completed: boolean
  bestScore?: number
  attempts: number
}

export const useTasksStore = defineStore('tasks', () => {
  const currentSession = ref<TaskSession | null>(null)

  const stories = ref<Story[]>([
    {
      id: '1',
      title: '小明的一天',
      difficulty: 'beginner',
      wordCount: 156,
      completed: false,
      paragraphs: [
        {
          words: [
            { chinese: '小明', pinyin: 'Xiǎo Míng', isKnown: true },
            { chinese: '是', pinyin: 'shì', isKnown: true },
            { chinese: '一个', pinyin: 'yí gè', isKnown: true },
            { chinese: '学生', pinyin: 'xué shēng', isLearning: true },
            { chinese: '。', pinyin: '。', isKnown: true },
          ],
          translation: 'Xiao Ming is a student.',
        },
      ],
    },
    {
      id: '2',
      title: '去商店',
      difficulty: 'beginner',
      wordCount: 128,
      completed: false,
      paragraphs: [
        {
          words: [
            { chinese: '我', pinyin: 'wǒ', isKnown: true },
            { chinese: '要', pinyin: 'yào', isKnown: true },
            { chinese: '去', pinyin: 'qù', isLearning: true },
            { chinese: '商店', pinyin: 'shāng diàn', isLearning: true },
            { chinese: '。', pinyin: '。', isKnown: true },
          ],
          translation: 'I want to go to the store.',
        },
      ],
    },
    {
      id: '3',
      title: '中国菜',
      difficulty: 'intermediate',
      wordCount: 234,
      completed: false,
      paragraphs: [
        {
          words: [
            { chinese: '中国菜', pinyin: 'zhōng guó cài' },
            { chinese: '很', pinyin: 'hěn', isKnown: true },
            { chinese: '好吃', pinyin: 'hǎo chī', isLearning: true },
            { chinese: '。', pinyin: '。', isKnown: true },
          ],
          translation: 'Chinese food is very delicious.',
        },
      ],
    },
  ])

  const characters = ref<Character[]>([
    {
      chinese: '人',
      pinyin: 'rén',
      meaning: 'person',
      strokes: 2,
      completed: false,
      attempts: 0,
    },
    {
      chinese: '大',
      pinyin: 'dà',
      meaning: 'big',
      strokes: 3,
      completed: false,
      attempts: 0,
    },
    {
      chinese: '小',
      pinyin: 'xiǎo',
      meaning: 'small',
      strokes: 3,
      completed: false,
      attempts: 0,
    },
    {
      chinese: '山',
      pinyin: 'shān',
      meaning: 'mountain',
      strokes: 3,
      completed: false,
      attempts: 0,
    },
    {
      chinese: '水',
      pinyin: 'shuǐ',
      meaning: 'water',
      strokes: 4,
      completed: false,
      attempts: 0,
    },
  ])

  const sessionHistory = ref<TaskSession[]>([])

  // Computed properties
  const availableStories = computed(() => stories.value.filter((story) => !story.completed))

  const completedStories = computed(() => stories.value.filter((story) => story.completed))

  const availableCharacters = computed(() => characters.value.filter((char) => !char.completed))

  const completedCharacters = computed(() => characters.value.filter((char) => char.completed))

  const taskProgress = computed(() => ({
    stories: {
      total: stories.value.length,
      completed: completedStories.value.length,
      available: availableStories.value.length,
    },
    characters: {
      total: characters.value.length,
      completed: completedCharacters.value.length,
      available: availableCharacters.value.length,
    },
  }))

  const isSessionActive = computed(() => currentSession.value && !currentSession.value.completed)

  // Actions
  function startSession(type: 'speaking' | 'reading' | 'writing', totalWords: number = 10) {
    if (currentSession.value && !currentSession.value.completed) {
      endSession()
    }

    currentSession.value = {
      id: Date.now().toString(),
      type,
      startTime: new Date(),
      wordsCompleted: [],
      totalWords,
      completed: false,
    }

    return currentSession.value
  }

  function endSession() {
    if (!currentSession.value) return

    currentSession.value.endTime = new Date()
    currentSession.value.completed = true

    if (currentSession.value.wordsCompleted.length > 0) {
      sessionHistory.value.push({ ...currentSession.value })
    }

    const completedSession = currentSession.value
    currentSession.value = null

    return completedSession
  }

  function addWordToSession(wordId: string, score?: number) {
    if (!currentSession.value) return

    currentSession.value.wordsCompleted.push(wordId)

    if (score !== undefined) {
      const scores = currentSession.value.wordsCompleted.length
      const currentAvg = currentSession.value.averageScore || 0
      currentSession.value.averageScore = (currentAvg * (scores - 1) + score) / scores
    }
  }

  function completeStory(storyId: string) {
    const story = stories.value.find((s) => s.id === storyId)
    if (story) {
      story.completed = true
      story.completedAt = new Date()
    }
  }

  function completeCharacter(chinese: string, score: number) {
    const character = characters.value.find((c) => c.chinese === chinese)
    if (character) {
      character.attempts++
      if (!character.bestScore || score > character.bestScore) {
        character.bestScore = score
      }
      if (score >= 80) {
        character.completed = true
      }
    }
  }

  function getStoryById(storyId: string) {
    return stories.value.find((s) => s.id === storyId)
  }

  function getCharacterByText(chinese: string) {
    return characters.value.find((c) => c.chinese === chinese)
  }

  function resetCharacterProgress(chinese: string) {
    const character = characters.value.find((c) => c.chinese === chinese)
    if (character) {
      character.completed = false
      character.bestScore = undefined
      character.attempts = 0
    }
  }

  function getSessionStats(days: number = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentSessions = sessionHistory.value.filter((s) => s.startTime > cutoff)

    return {
      totalSessions: recentSessions.length,
      totalWords: recentSessions.reduce((sum, s) => sum + s.wordsCompleted.length, 0),
      averageScore:
        recentSessions.length > 0
          ? recentSessions.reduce((sum, s) => sum + (s.averageScore || 0), 0) /
            recentSessions.length
          : 0,
      sessionsByType: {
        speaking: recentSessions.filter((s) => s.type === 'speaking').length,
        reading: recentSessions.filter((s) => s.type === 'reading').length,
        writing: recentSessions.filter((s) => s.type === 'writing').length,
      },
    }
  }

  function addStory(story: Omit<Story, 'id' | 'completed'>) {
    const newStory: Story = {
      ...story,
      id: Date.now().toString(),
      completed: false,
    }
    stories.value.push(newStory)
    return newStory
  }

  function addCharacter(character: Omit<Character, 'completed' | 'attempts'>) {
    const newCharacter: Character = {
      ...character,
      completed: false,
      attempts: 0,
    }
    characters.value.push(newCharacter)
    return newCharacter
  }

  return {
    currentSession,
    stories,
    characters,
    sessionHistory,
    availableStories,
    completedStories,
    availableCharacters,
    completedCharacters,
    taskProgress,
    isSessionActive,
    startSession,
    endSession,
    addWordToSession,
    completeStory,
    completeCharacter,
    getStoryById,
    getCharacterByText,
    resetCharacterProgress,
    getSessionStats,
    addStory,
    addCharacter,
  }
})
