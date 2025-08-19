import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a fresh session
    await page.context().clearCookies()
    await page.goto('/')
  })

  test('should display welcome page when not authenticated', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome to MandarinPath')
    await expect(page.locator('text=Start Learning')).toBeVisible()
  })

  test('should open auth modal when clicking Start Learning', async ({ page }) => {
    await page.click('text=Start Learning')
    
    // Auth modal should be visible
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible()
    await expect(page.locator('text=Sign Up')).toBeVisible()
    await expect(page.locator('text=Log In')).toBeVisible()
  })

  test('should register a new user successfully', async ({ page }) => {
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'
    const testDisplayName = `Test User ${timestamp}`

    // Open auth modal
    await page.click('text=Start Learning')
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible()

    // Fill registration form
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.fill('[data-testid="display-name-input"]', testDisplayName)

    // Submit registration
    await page.click('[data-testid="register-button"]')

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator(`text=${testDisplayName}`)).toBeVisible()
  })

  test('should login existing user successfully', async ({ page }) => {
    // First register a user
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'

    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')

    // Wait for redirect and then logout
    await expect(page).toHaveURL('/dashboard')
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    // Should be back to welcome page
    await expect(page).toHaveURL('/')

    // Now test login
    await page.click('text=Start Learning')
    await page.click('text=Already have an account? Log in')

    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="login-button"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Start Learning')
    await page.click('text=Already have an account? Log in')

    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
  })

  test('should validate email format', async ({ page }) => {
    await page.click('text=Start Learning')

    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // Focus away from email field to trigger validation
    await page.click('[data-testid="password-input"]')

    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Please enter a valid email')
  })

  test('should validate password requirements', async ({ page }) => {
    await page.click('text=Start Learning')

    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', '123') // Too short
    
    // Focus away to trigger validation
    await page.click('[data-testid="email-input"]')

    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters')
  })

  test('should handle CSRF token correctly', async ({ page }) => {
    // This test specifically validates the CSRF fix we implemented
    
    // Navigate to get CSRF token
    await page.goto('/')
    
    // Check that CSRF token is set in cookies
    const cookies = await page.context().cookies()
    const csrfCookie = cookies.find(cookie => cookie.name === 'csrf-token')
    expect(csrfCookie).toBeTruthy()
    expect(csrfCookie?.value).toBeTruthy()

    // Attempt registration (which should succeed with CSRF token)
    const timestamp = Date.now()
    const testEmail = `csrf-test${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'

    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')

    // Should succeed without CSRF errors
    await expect(page).toHaveURL('/dashboard')
  })

  test('should logout user successfully', async ({ page }) => {
    // Register and login first
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'

    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')

    await expect(page).toHaveURL('/dashboard')

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    // Should be back to welcome page
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Welcome to MandarinPath')
  })

  test('should logout from all sessions', async ({ page, context }) => {
    // Register user
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'

    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')

    await expect(page).toHaveURL('/dashboard')

    // Create second session in new context
    const secondContext = await page.context().browser()?.newContext()
    if (secondContext) {
      const secondPage = await secondContext.newPage()
      await secondPage.goto('/')
      await secondPage.click('text=Start Learning')
      await secondPage.click('text=Already have an account? Log in')
      await secondPage.fill('[data-testid="email-input"]', testEmail)
      await secondPage.fill('[data-testid="password-input"]', testPassword)
      await secondPage.click('[data-testid="login-button"]')

      await expect(secondPage).toHaveURL('/dashboard')

      // Logout all from first session
      await page.click('[data-testid="user-menu"]')
      await page.click('[data-testid="logout-all-button"]')

      // Both sessions should be logged out
      await expect(page).toHaveURL('/')
      
      // Second session should also be logged out when refreshed
      await secondPage.reload()
      await expect(secondPage).toHaveURL('/')

      await secondContext.close()
    }
  })
})