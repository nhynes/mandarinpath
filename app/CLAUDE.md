# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Vue.js frontend application.

## Development Commands

All commands should be run from the `app/` directory:

```bash
cd app

# Development
pnpm install    # Install dependencies
pnpm dev        # Start development server with hot reload

# Building
pnpm build      # Type-check and build for production
pnpm preview    # Preview production build locally

# Code Quality
pnpm type-check # Run TypeScript type checking
pnpm lint       # Run linting (ESLint + oxlint) with auto-fix
pnpm format     # Format code with Prettier
```

## Architecture

### Core State Management (Pinia Stores)
- **tasks.ts**: Manages learning tasks, stories, characters, and task sessions
- **vocabulary.ts**: Handles word management, progress tracking, and spaced repetition
- **user.ts**: User statistics, preferences, and activity history

### Key Data Models
- **TaskSession**: Tracks active learning sessions with timing and completion data
- **Story**: Reading comprehension materials with paragraphs and word annotations
- **Character**: Chinese characters for handwriting practice with stroke data
- **Word**: Vocabulary items with task-specific completion tracking and strength scoring

### Task Types and Learning Workflow
Each new word is associated with multiple learning tasks:

1. **Speaking Tasks**: Pronunciation practice with AI-powered grading via upstream API
   - Primary focus for spoken language training
   - Helps train muscle memory for pronunciation
   
2. **Reading Tasks**: Words appear in generated graded readers
   - Builds reading comprehension and pinyin recognition
   - Supports pinyin IME training through visual association
   
3. **Writing/Drawing Tasks**: Character stroke practice on touchscreen devices
   - Goal is basic character recognition, not mastery
   - Uses very long spaced repetition schedule since writing is deprioritized with modern IME
   - Characters drawn with finger/stylus on touch devices

### Intelligent Task Management
- **Smart difficulty assessment**: If a user knows component words (e.g., `不` and `是`), compound words like `不是` may skip certain tasks
- **Adaptive scheduling**: Backend determines which words need attention based on performance patterns
- **Task selection**: Users choose which task types to practice based on context (e.g., speaking at home, reading anywhere)

### View Structure
- **HomeView.vue**: Dashboard with task overview and statistics
- **ProfileView.vue**: User statistics and preferences
- **SpeakingTaskView.vue**: Pronunciation practice interface
- **ReadingTaskView.vue**: Story reading with word interaction
- **DrawingTaskView.vue**: Character writing practice
- **LoadingView.vue**: Loading states during task transitions

### Component Patterns
- Uses Vue 3 Composition API throughout
- Pinia stores accessed via `use*Store()` composables
- TypeScript interfaces define strict data structures
- Component props and emits are typed

### Styling and Build
- CSS located in `src/assets/` with modular approach
- Vite configuration includes Vue DevTools plugin
- Path alias `@` points to `src/` directory
- ESLint + oxlint for code quality, Prettier for formatting

## Development Notes

- All Chinese text includes pinyin annotations for pronunciation
- Word strength system (0-100) drives spaced repetition scheduling
- Task completion tracking is granular (per word, per task type)
- Session history maintains learning analytics
- Character practice includes stroke order and scoring
- Word loading mechanism is TBD but assume word lists will be provided initially