import { test, expect } from '@playwright/test'

test.describe('Navigation and Routing', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.context().clearCookies()
    await page.goto('/')
    
    const timestamp = Date.now()
    const testEmail = `nav${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'
    
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should navigate between main sections', async ({ page }) => {
    // Dashboard (already there)
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
    
    // Profile
    await page.click('[data-testid="profile-link"]')
    await expect(page).toHaveURL('/profile')
    await expect(page.locator('text=Profile')).toBeVisible()
    
    // Back to Dashboard
    await page.click('[data-testid="dashboard-link"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should handle direct URL navigation when authenticated', async ({ page }) => {
    // Direct navigation to profile should work
    await page.goto('/profile')
    await expect(page).toHaveURL('/profile')
    await expect(page.locator('text=Profile')).toBeVisible()
    
    // Direct navigation to task views should work
    await page.goto('/tasks/speaking')
    await expect(page).toHaveURL('/tasks/speaking')
    
    await page.goto('/tasks/reading')
    await expect(page).toHaveURL('/tasks/reading')
  })

  test('should redirect to login when accessing protected routes while unauthenticated', async ({ page }) => {
    // Logout first
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')
    await expect(page).toHaveURL('/')
    
    // Try to access protected routes
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Welcome to MandarinPath')).toBeVisible()
    
    await page.goto('/profile')
    await expect(page).toHaveURL('/')
    
    await page.goto('/tasks/speaking')
    await expect(page).toHaveURL('/')
  })

  test('should show active navigation state', async ({ page }) => {
    // Dashboard should be active initially
    await expect(page.locator('[data-testid="dashboard-link"]')).toHaveClass(/active/)
    
    // Navigate to profile
    await page.click('[data-testid="profile-link"]')
    await expect(page.locator('[data-testid="profile-link"]')).toHaveClass(/active/)
    await expect(page.locator('[data-testid="dashboard-link"]')).not.toHaveClass(/active/)
  })

  test('should maintain navigation state during task sessions', async ({ page }) => {
    await page.click('[data-testid="start-speaking"]')
    await expect(page).toHaveURL('/tasks/speaking')
    
    // Navigation should still be available
    await expect(page.locator('[data-testid="dashboard-link"]')).toBeVisible()
    await expect(page.locator('[data-testid="profile-link"]')).toBeVisible()
    
    // Can navigate away from task
    await page.click('[data-testid="dashboard-link"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate to profile
    await page.click('[data-testid="profile-link"]')
    await expect(page).toHaveURL('/profile')
    
    // Use browser back button
    await page.goBack()
    await expect(page).toHaveURL('/dashboard')
    
    // Use browser forward button
    await page.goForward()
    await expect(page).toHaveURL('/profile')
  })

  test('should show 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page')
    await expect(page.locator('text=Page Not Found')).toBeVisible()
    await expect(page.locator('[data-testid="return-home"]')).toBeVisible()
    
    // Should be able to return home
    await page.click('[data-testid="return-home"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should preserve URL parameters and fragments', async ({ page }) => {
    // Navigate with query parameters
    await page.goto('/profile?tab=preferences')
    await expect(page).toHaveURL('/profile?tab=preferences')
    
    // Navigate with fragment
    await page.goto('/profile#settings')
    await expect(page).toHaveURL('/profile#settings')
  })

  test('should handle rapid navigation clicks', async ({ page }) => {
    // Rapidly click between navigation items
    await page.click('[data-testid="profile-link"]')
    await page.click('[data-testid="dashboard-link"]')
    await page.click('[data-testid="profile-link"]')
    
    // Should end up at the last clicked destination
    await expect(page).toHaveURL('/profile')
    await expect(page.locator('text=Profile')).toBeVisible()
  })
})