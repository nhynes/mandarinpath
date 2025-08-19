import { type FullConfig } from '@playwright/test'

/**
 * Global teardown for e2e tests
 * Cleans up after all tests are complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for MandarinPath e2e tests...')
  
  // Clean up test database and any temporary files
  try {
    // Note: The test database cleanup should happen automatically
    // when the backend server shuts down, but we could add explicit cleanup here
    console.log('✅ Global teardown completed successfully')
  } catch (error) {
    console.error('❌ Error during global teardown:', error)
  }
}

export default globalTeardown