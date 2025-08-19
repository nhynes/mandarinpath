# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MandarinPath is a Chinese language learning application designed to create a fully automated language tutor that makes learning Chinese both fun and productive. The focus is on real-world skills rather than rote memorization, prioritizing spoken language training and character writing practice.

### Core Learning Philosophy
- **No "due" words**: Unlike traditional SRS systems, there's no concept of overdue cards to avoid demoralizing catchup sessions
- **Intelligent word selection**: The system determines difficulty based on user performance on similar words, not just individual card history
- **Instant feedback**: All tasks are graded automatically by AI for immediate, personalized, and cost-effective learning
- **User choice**: Users can select which task types they want to practice (speaking, reading, writing)
- **Progress visibility**: Clear progress indicators to maintain motivation

### Repository Structure
- **`app/`**: Vue.js frontend application (see `app/CLAUDE.md` for specific details)
- **`backend/`**: Rust backend server (see `backend/CLAUDE.md` for specific details)

## Development Requirements

### Code Quality Standards by Directory

#### Frontend (`app/` directory)
**CRITICAL**: After making any changeset to frontend code, you MUST run from `app/` directory:
1. **Formatting**: `pnpm format` - Format code with Prettier
2. **Linting**: `pnpm lint` - Run ESLint + oxlint with auto-fix
3. **Type checking**: `pnpm type-check` - Verify TypeScript compilation
4. **Tests**: Run all relevant tests (unit, integration, UI)

#### Backend (`backend/` directory)
**CRITICAL**: After making any changeset to backend code, you MUST run from `backend/` directory:
1. **Formatting**: `cargo fmt` - Format Rust code with rustfmt
2. **Linting**: `cargo clippy` - Run Rust linter with suggestions
3. **Type checking**: `cargo check` - Verify Rust compilation
4. **Tests**: `cargo test` - Run all unit and integration tests

### Testing Requirements
**MANDATORY**: When adding new features or fixing bugs, you MUST:
- Add unit tests for utility functions and business logic
- Add integration tests for component interactions
- Add UI tests for user workflows (frontend)
- Ensure all tests pass before considering work complete

## Development Notes

- All Chinese text includes pinyin annotations for pronunciation
- Word strength system (0-100) drives spaced repetition scheduling
- Task completion tracking is granular (per word, per task type)
- Session history maintains learning analytics
- Character practice includes stroke order and scoring
- Word loading mechanism is TBD but assume word lists will be provided initially