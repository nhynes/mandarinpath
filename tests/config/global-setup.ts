import { chromium, type FullConfig } from '@playwright/test'

/**
 * Global setup for e2e tests
 * Prepares the test environment before running tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for MandarinPath e2e tests...')
  
  // Create a browser instance to verify servers are ready
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for backend health check
    console.log('⏳ Waiting for backend server...')
    let backendReady = false
    for (let i = 0; i < 30; i++) {
      try {
        const response = await page.request.get('http://localhost:3000/api/health')
        if (response.ok()) {
          backendReady = true
          break
        }
      } catch (error) {
        // Server not ready yet, wait
      }
      await page.waitForTimeout(1000)
    }
    
    if (!backendReady) {
      throw new Error('Backend server failed to start within 30 seconds')
    }
    console.log('✅ Backend server is ready')
    
    // Wait for frontend
    console.log('⏳ Waiting for frontend server...')
    let frontendReady = false
    for (let i = 0; i < 30; i++) {
      try {
        const response = await page.request.get('http://localhost:5173')
        if (response.ok()) {
          frontendReady = true
          break
        }
      } catch (error) {
        // Server not ready yet, wait
      }
      await page.waitForTimeout(1000)
    }
    
    if (!frontendReady) {
      throw new Error('Frontend server failed to start within 30 seconds')
    }
    console.log('✅ Frontend server is ready')
    
    // Clear any existing test data
    console.log('🧹 Cleaning up test database...')
    try {
      await page.request.post('http://localhost:3000/api/test/cleanup', {
        failOnStatusCode: false // This endpoint might not exist yet
      })
    } catch (error) {
      console.log('⚠️  Test cleanup endpoint not available (this is okay)')
    }
    
    console.log('✅ Global setup completed successfully')
    
  } finally {
    await browser.close()
  }
}

export default globalSetup