import { test, expect } from '@playwright/test'

test.describe('API Integration', () => {
  test('should handle API connectivity and health checks', async ({ page }) => {
    // Check backend health endpoint directly
    const response = await page.request.get('http://localhost:3000/api/health')
    expect(response.ok()).toBeTruthy()
    
    const healthData = await response.json()
    expect(healthData).toHaveProperty('status', 'healthy')
    expect(healthData).toHaveProperty('timestamp')
  })

  test('should handle CSRF token lifecycle correctly', async ({ page }) => {
    // Navigate to app to get CSRF token
    await page.goto('/')
    
    // Check CSRF cookie is set
    const cookies = await page.context().cookies()
    const csrfCookie = cookies.find(cookie => cookie.name === 'csrf-token')
    expect(csrfCookie).toBeTruthy()
    expect(csrfCookie?.value).toBeTruthy()
    
    // Make API request that requires CSRF token
    const timestamp = Date.now()
    const testEmail = `csrf${timestamp}@example.com`
    
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
    
    // Monitor network requests to ensure CSRF header is included
    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/auth/register') && 
      request.method() === 'POST'
    )
    
    await page.click('[data-testid="register-button"]')
    
    const request = await requestPromise
    const headers = request.headers()
    expect(headers['x-csrf-token']).toBeTruthy()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/auth/register', route => {
      route.abort('failed')
    })
    
    await page.goto('/')
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="register-button"]')
    
    // Should show network error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error')
  })

  test('should handle server errors (5xx) gracefully', async ({ page }) => {
    // Mock server error
    await page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    await page.goto('/')
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="register-button"]')
    
    // Should show server error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('server error')
  })

  test('should handle rate limiting', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED' 
        })
      })
    })
    
    await page.goto('/')
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="register-button"]')
    
    // Should show rate limit message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Rate limit')
  })

  test('should handle authentication token refresh', async ({ page }) => {
    // Register and login first
    const timestamp = Date.now()
    const testEmail = `token${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'
    
    await page.goto('/')
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    
    // Mock expired token response followed by successful refresh
    let callCount = 0
    await page.route('**/api/auth/me', route => {
      callCount++
      if (callCount === 1) {
        // First call: token expired
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token expired' })
        })
      } else {
        // Second call: after refresh, should succeed
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-id',
            email: testEmail,
            display_name: null,
            created_at: new Date().toISOString()
          })
        })
      }
    })
    
    // Trigger a request that requires authentication
    await page.reload()
    
    // Should handle token refresh automatically and stay logged in
    await expect(page).toHaveURL('/dashboard')
  })

  test('should handle concurrent API requests correctly', async ({ page }) => {
    await page.goto('/')
    
    // Simulate multiple rapid requests
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(
        page.request.get('http://localhost:3000/api/health')
      )
    }
    
    const responses = await Promise.all(promises)
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy()
    })
  })

  test('should maintain session across page refreshes', async ({ page }) => {
    // Register and login
    const timestamp = Date.now()
    const testEmail = `session${timestamp}@example.com`
    const testPassword = 'SecurePassword123!'
    
    await page.goto('/')
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', testPassword)
    await page.click('[data-testid="register-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    
    // Refresh the page
    await page.reload()
    
    // Should still be logged in
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should handle API timeout gracefully', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/auth/register', route => {
      // Delay response beyond reasonable timeout
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Eventually successful' })
        })
      }, 10000) // 10 second delay
    })
    
    await page.goto('/')
    await page.click('text=Start Learning')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="register-button"]')
    
    // Should show loading state initially
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    
    // Should eventually timeout and show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('timeout')
  })
})