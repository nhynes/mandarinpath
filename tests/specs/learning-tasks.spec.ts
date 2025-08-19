import { test, expect } from '@playwright/test'

test.describe('Learning Tasks Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.context().clearCookies()
    await page.goto('/')
    
    const timestamp = Date.now()
    const testEmail = `learner${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'
    
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display dashboard with learning options', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('[data-testid="speaking-tasks"]')).toBeVisible()
    await expect(page.locator('[data-testid="reading-tasks"]')).toBeVisible()
    await expect(page.locator('[data-testid="writing-tasks"]')).toBeVisible()
  })

  test('should show user preferences for task types', async ({ page }) => {
    // Check default preferences
    await expect(page.locator('[data-testid="speaking-toggle"]')).toBeChecked()
    await expect(page.locator('[data-testid="reading-toggle"]')).toBeChecked()
    await expect(page.locator('[data-testid="writing-toggle"]')).not.toBeChecked()
  })

  test('should allow user to modify task preferences', async ({ page }) => {
    // Go to profile/preferences
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="preferences-link"]')
    
    await expect(page).toHaveURL('/profile')
    
    // Toggle writing tasks on
    await page.click('[data-testid="writing-toggle"]')
    await expect(page.locator('[data-testid="writing-toggle"]')).toBeChecked()
    
    // Toggle speaking tasks off
    await page.click('[data-testid="speaking-toggle"]')
    await expect(page.locator('[data-testid="speaking-toggle"]')).not.toBeChecked()
    
    // Save preferences
    await page.click('[data-testid="save-preferences"]')
    await expect(page.locator('[data-testid="preferences-saved"]')).toBeVisible()
    
    // Go back to dashboard and verify changes
    await page.click('[data-testid="dashboard-link"]')
    await expect(page.locator('[data-testid="speaking-tasks"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="writing-tasks"]')).toBeVisible()
  })

  test('should start speaking task session', async ({ page }) => {
    await page.click('[data-testid="start-speaking"]')
    
    await expect(page).toHaveURL('/tasks/speaking')
    await expect(page.locator('text=Speaking Practice')).toBeVisible()
    
    // Should show word to practice
    await expect(page.locator('[data-testid="current-word"]')).toBeVisible()
    await expect(page.locator('[data-testid="pinyin"]')).toBeVisible()
    await expect(page.locator('[data-testid="record-button"]')).toBeVisible()
  })

  test('should start reading task session', async ({ page }) => {
    await page.click('[data-testid="start-reading"]')
    
    await expect(page).toHaveURL('/tasks/reading')
    await expect(page.locator('text=Reading Practice')).toBeVisible()
    
    // Should show story content
    await expect(page.locator('[data-testid="story-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="story-content"]')).toBeVisible()
  })

  test('should start writing task session when enabled', async ({ page }) => {
    // First enable writing tasks
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="preferences-link"]')
    await page.click('[data-testid="writing-toggle"]')
    await page.click('[data-testid="save-preferences"]')
    await page.click('[data-testid="dashboard-link"]')
    
    await page.click('[data-testid="start-writing"]')
    
    await expect(page).toHaveURL('/tasks/writing')
    await expect(page.locator('text=Character Practice')).toBeVisible()
    
    // Should show character to practice
    await expect(page.locator('[data-testid="character-display"]')).toBeVisible()
    await expect(page.locator('[data-testid="drawing-canvas"]')).toBeVisible()
  })

  test('should track task completion and update statistics', async ({ page }) => {
    // Get initial stats
    const initialTasksCompleted = await page.locator('[data-testid="tasks-completed"]').textContent()
    
    // Complete a speaking task (mock completion)
    await page.click('[data-testid="start-speaking"]')
    await expect(page).toHaveURL('/tasks/speaking')
    
    // Simulate completing the task
    await page.click('[data-testid="mark-complete"]')
    
    // Should return to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Stats should be updated
    const newTasksCompleted = await page.locator('[data-testid="tasks-completed"]').textContent()
    expect(newTasksCompleted).not.toBe(initialTasksCompleted)
  })

  test('should show recent activity history', async ({ page }) => {
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-list"]')).toBeVisible()
    
    // Should have some default activities or be empty for new user
    const activities = page.locator('[data-testid="activity-item"]')
    const activityCount = await activities.count()
    expect(activityCount).toBeGreaterThanOrEqual(0)
  })

  test('should display user progress statistics', async ({ page }) => {
    // Check that stats are displayed
    await expect(page.locator('[data-testid="words-learned"]')).toBeVisible()
    await expect(page.locator('[data-testid="current-streak"]')).toBeVisible()
    await expect(page.locator('[data-testid="study-time"]')).toBeVisible()
    await expect(page.locator('[data-testid="tasks-completed"]')).toBeVisible()
  })

  test('should handle task interruption and resume', async ({ page }) => {
    // Start a task
    await page.click('[data-testid="start-speaking"]')
    await expect(page).toHaveURL('/tasks/speaking')
    
    // Navigate away (interrupt task)
    await page.click('[data-testid="dashboard-link"]')
    await expect(page).toHaveURL('/dashboard')
    
    // Should show option to resume interrupted task
    await expect(page.locator('[data-testid="resume-task"]')).toBeVisible()
    await expect(page.locator('[data-testid="resume-task"]')).toContainText('Resume Speaking Practice')
    
    // Resume the task
    await page.click('[data-testid="resume-task"]')
    await expect(page).toHaveURL('/tasks/speaking')
  })

  test('should show loading state during task transitions', async ({ page }) => {
    await page.click('[data-testid="start-speaking"]')
    
    // Should show loading state briefly
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    
    // Then show the actual task
    await expect(page).toHaveURL('/tasks/speaking')
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="current-word"]')).toBeVisible()
  })

  test('should handle task completion flow', async ({ page }) => {
    await page.click('[data-testid="start-reading"]')
    await expect(page).toHaveURL('/tasks/reading')
    
    // Complete the reading task
    await page.click('[data-testid="finish-reading"]')
    
    // Should show completion screen
    await expect(page.locator('[data-testid="task-complete"]')).toBeVisible()
    await expect(page.locator('[data-testid="completion-score"]')).toBeVisible()
    
    // Option to continue or return to dashboard
    await expect(page.locator('[data-testid="continue-learning"]')).toBeVisible()
    await expect(page.locator('[data-testid="return-dashboard"]')).toBeVisible()
    
    await page.click('[data-testid="return-dashboard"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show pinyin when enabled in preferences', async ({ page }) => {
    // Ensure pinyin is enabled (default)
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="preferences-link"]')
    await expect(page.locator('[data-testid="pinyin-toggle"]')).toBeChecked()
    await page.click('[data-testid="dashboard-link"]')
    
    // Start a task and check pinyin is visible
    await page.click('[data-testid="start-reading"]')
    await expect(page.locator('[data-testid="pinyin-annotations"]')).toBeVisible()
    
    // Go back and disable pinyin
    await page.click('[data-testid="dashboard-link"]')
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="preferences-link"]')
    await page.click('[data-testid="pinyin-toggle"]')
    await page.click('[data-testid="save-preferences"]')
    await page.click('[data-testid="dashboard-link"]')
    
    // Start task again - pinyin should be hidden
    await page.click('[data-testid="start-reading"]')
    await expect(page.locator('[data-testid="pinyin-annotations"]')).not.toBeVisible()
  })
})