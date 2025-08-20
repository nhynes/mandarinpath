import { test, expect } from '@playwright/test'

test.describe('Speaking Practice Integration', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone'])
    
    // Mock the speech evaluation API to return predictable results
    await page.route('**/api/speech/evaluate', async route => {
      const formData = route.request().postData()
      
      // Simulate successful speech evaluation response
      const mockResponse = {
        success: true,
        data: {
          overall_scores: {
            pronunciation: 88,
            fluency: 85,
            tone: 90
          },
          words: [
            {
              word: '你好',
              pinyin: 'nǐ hǎo',
              tone: 'tone3_tone3',
              scores: {
                overall: 90,
                pronunciation: 88,
                tone: 92,
                prominence: 85
              },
              read_type: 0,
              span: {
                start: 0,
                end: 50
              },
              phonemes: [
                {
                  phoneme: 'n',
                  pronunciation: 90,
                  span: { start: 0, end: 10 },
                  tone_index: 3,
                  phone: 'n_3'
                },
                {
                  phoneme: 'i',
                  pronunciation: 85,
                  span: { start: 10, end: 25 },
                  tone_index: 3
                }
              ]
            }
          ],
          error: null
        }
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      })
    })

    // Navigate directly to speaking practice
    await page.goto('/speaking')
  })

  test('should display speaking practice interface', async ({ page }) => {
    // Check main interface elements
    await expect(page.locator('.speaking-content')).toBeVisible()
    await expect(page.locator('.task-header')).toBeVisible()
    await expect(page.locator('.speaking-card')).toBeVisible()
    
    // Check word display
    await expect(page.locator('.chinese-character')).toBeVisible()
    await expect(page.locator('.definition')).toBeVisible()
    
    // Check recording section
    await expect(page.locator('.record-button')).toBeVisible()
    await expect(page.locator('.record-button')).not.toBeDisabled()
    
    // Check task actions
    await expect(page.locator('.skip-button')).toBeVisible()
    await expect(page.locator('.hint-button')).toBeVisible()
    await expect(page.locator('.next-button')).toBeVisible()
  })

  test('should show current word and progress', async ({ page }) => {
    // Check initial word display
    await expect(page.locator('.chinese-character')).toContainText('你好')
    await expect(page.locator('.definition')).toContainText('hello')
    
    // Check progress indicator
    const progressIndicator = page.locator('.progress-indicator')
    await expect(progressIndicator).toContainText('1')
    await expect(progressIndicator).toContainText('5')
    
    // Pinyin should be hidden initially
    await expect(page.locator('.pinyin')).not.toBeVisible()
  })

  test('should toggle pinyin visibility with hint button', async ({ page }) => {
    // Initially pinyin should be hidden
    await expect(page.locator('.pinyin')).not.toBeVisible()
    
    // Click hint button
    await page.click('.hint-button')
    
    // Pinyin should now be visible
    await expect(page.locator('.pinyin')).toBeVisible()
    await expect(page.locator('.pinyin')).toContainText('nǐ hǎo')
    
    // Button text should update
    await expect(page.locator('.hint-button')).toContainText('Hide')
    
    // Click again to hide
    await page.click('.hint-button')
    await expect(page.locator('.pinyin')).not.toBeVisible()
    await expect(page.locator('.hint-button')).toContainText('Show')
  })

  test('should handle recording interaction', async ({ page }) => {
    // Mock MediaRecorder functionality
    await page.addInitScript(() => {
      class MockMediaRecorder {
        public state = 'inactive'
        public ondataavailable: ((event: BlobEvent) => void) | null = null
        public onstop: (() => void) | null = null

        constructor(public stream: MediaStream) {}

        start() {
          this.state = 'recording'
          // Simulate data available after short delay
          setTimeout(() => {
            if (this.ondataavailable) {
              const blob = new Blob(['mock audio'], { type: 'audio/webm' })
              const event = new BlobEvent('dataavailable', { data: blob })
              this.ondataavailable(event)
            }
          }, 50)
        }

        stop() {
          this.state = 'inactive'
          setTimeout(() => {
            if (this.onstop) {
              this.onstop()
            }
          }, 10)
        }
      }

      window.MediaRecorder = MockMediaRecorder as any

      // Mock getUserMedia
      navigator.mediaDevices.getUserMedia = () => 
        Promise.resolve(new MediaStream())
    })

    const recordButton = page.locator('.record-button')
    
    // Initially should not be recording
    await expect(recordButton).not.toHaveClass(/recording/)
    await expect(recordButton).toContainText('Click or Hold to Record')
    
    // Start recording by pressing button
    await recordButton.press('ArrowDown') // Simulate mousedown
    await page.waitForTimeout(100) // Small delay for recording state
    
    // Should show recording state
    await expect(recordButton).toHaveClass(/recording/)
    await expect(recordButton).toContainText('Recording...')
    
    // Release button to stop recording
    await recordButton.press('ArrowUp') // Simulate mouseup
    
    // Should show processing state
    await expect(recordButton).toContainText('Processing...')
    
    // Wait for processing to complete
    await page.waitForSelector('.feedback-section', { timeout: 5000 })
    
    // Should show feedback
    await expect(page.locator('.feedback-section')).toBeVisible()
    await expect(page.locator('.feedback-title')).toContainText('Feedback')
    await expect(page.locator('.score')).toBeVisible()
  })

  test('should display detailed feedback after evaluation', async ({ page }) => {
    // Simulate a recording and evaluation
    await page.addInitScript(() => {
      // Mock media recording as before
      class MockMediaRecorder {
        public state = 'inactive'
        public ondataavailable: ((event: BlobEvent) => void) | null = null
        public onstop: (() => void) | null = null

        constructor(public stream: MediaStream) {}

        start() {
          this.state = 'recording'
          setTimeout(() => {
            if (this.ondataavailable) {
              const blob = new Blob(['mock audio'], { type: 'audio/webm' })
              const event = new BlobEvent('dataavailable', { data: blob })
              this.ondataavailable(event)
            }
          }, 50)
        }

        stop() {
          this.state = 'inactive'
          setTimeout(() => {
            if (this.onstop) {
              this.onstop()
            }
          }, 10)
        }
      }

      window.MediaRecorder = MockMediaRecorder as any
      navigator.mediaDevices.getUserMedia = () => Promise.resolve(new MediaStream())
    })

    // Record and submit
    const recordButton = page.locator('.record-button')
    await recordButton.click()
    await page.waitForTimeout(200)
    await recordButton.click()
    
    // Wait for feedback to appear
    await page.waitForSelector('.feedback-section', { timeout: 5000 })
    
    // Check overall feedback
    await expect(page.locator('.feedback-section')).toBeVisible()
    await expect(page.locator('.score')).toContainText('88%')
    await expect(page.locator('.feedback-text')).toBeVisible()
    
    // Check word analysis section
    await expect(page.locator('.word-analysis')).toBeVisible()
    await expect(page.locator('.analysis-title')).toContainText('Word Analysis')
    await expect(page.locator('.word-scores')).toBeVisible()
    
    // Check individual word feedback
    const wordScoreItem = page.locator('.word-score-item').first()
    await expect(wordScoreItem).toBeVisible()
    await expect(wordScoreItem.locator('.word-text')).toContainText('你好')
    await expect(wordScoreItem.locator('.word-pinyin')).toContainText('nǐ hǎo')
    await expect(wordScoreItem.locator('.score-details')).toBeVisible()
    
    // Check audio comparison
    await expect(page.locator('.audio-comparison')).toBeVisible()
    await expect(page.locator('audio')).toBeVisible()
    await expect(page.locator('.play-target-button')).toBeVisible()
    
    // Next button should be enabled after attempt
    await expect(page.locator('.next-button')).not.toBeDisabled()
  })

  test('should progress to next word', async ({ page }) => {
    // Make an attempt first
    await page.addInitScript(() => {
      class MockMediaRecorder {
        public state = 'inactive'
        public ondataavailable: ((event: BlobEvent) => void) | null = null
        public onstop: (() => void) | null = null

        constructor(public stream: MediaStream) {}

        start() {
          this.state = 'recording'
          setTimeout(() => {
            if (this.ondataavailable) {
              const blob = new Blob(['mock audio'], { type: 'audio/webm' })
              const event = new BlobEvent('dataavailable', { data: blob })
              this.ondataavailable(event)
            }
          }, 50)
        }

        stop() {
          this.state = 'inactive'
          setTimeout(() => {
            if (this.onstop) {
              this.onstop()
            }
          }, 10)
        }
      }

      window.MediaRecorder = MockMediaRecorder as any
      navigator.mediaDevices.getUserMedia = () => Promise.resolve(new MediaStream())
    })

    // Initial word should be 你好
    await expect(page.locator('.chinese-character')).toContainText('你好')
    await expect(page.locator('.progress-indicator')).toContainText('1')
    
    // Make an attempt
    await page.click('.record-button')
    await page.waitForTimeout(200)
    await page.click('.record-button')
    await page.waitForSelector('.feedback-section', { timeout: 5000 })
    
    // Click next word
    await page.click('.next-button')
    
    // Should move to second word
    await expect(page.locator('.chinese-character')).toContainText('谢谢')
    await expect(page.locator('.definition')).toContainText('thank you')
    await expect(page.locator('.progress-indicator')).toContainText('2')
    
    // Feedback section should be hidden for new word
    await expect(page.locator('.feedback-section')).not.toBeVisible()
    
    // Pinyin should be hidden again
    await expect(page.locator('.pinyin')).not.toBeVisible()
  })

  test('should skip word without attempt', async ({ page }) => {
    // Initial word should be 你好
    await expect(page.locator('.chinese-character')).toContainText('你好')
    await expect(page.locator('.progress-indicator')).toContainText('1')
    
    // Click skip button
    await page.click('.skip-button')
    
    // Should move to next word without requiring attempt
    await expect(page.locator('.chinese-character')).toContainText('谢谢')
    await expect(page.locator('.progress-indicator')).toContainText('2')
  })

  test('should play target audio', async ({ page }) => {
    // Mock speechSynthesis
    await page.addInitScript(() => {
      window.speechSynthesis = {
        speak: (utterance: any) => {
          // Mock speak function
          console.log('Playing:', utterance.text)
        },
        cancel: () => {},
        pause: () => {},
        resume: () => {},
        getVoices: () => []
      } as any

      window.SpeechSynthesisUtterance = function(text?: string) {
        this.text = text || ''
        this.lang = ''
        this.rate = 1
      } as any
    })

    // Click play target button
    await page.click('.play-target-button')
    
    // Should not throw error (speechSynthesis.speak was called)
    // We can't easily test audio playback in Playwright, but we can ensure no errors
  })

  test('should handle API error gracefully', async ({ page }) => {
    // Override the API mock to return error
    await page.route('**/api/speech/evaluate', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    await page.addInitScript(() => {
      class MockMediaRecorder {
        public state = 'inactive'
        public ondataavailable: ((event: BlobEvent) => void) | null = null
        public onstop: (() => void) | null = null

        constructor(public stream: MediaStream) {}

        start() {
          this.state = 'recording'
          setTimeout(() => {
            if (this.ondataavailable) {
              const blob = new Blob(['mock audio'], { type: 'audio/webm' })
              const event = new BlobEvent('dataavailable', { data: blob })
              this.ondataavailable(event)
            }
          }, 50)
        }

        stop() {
          this.state = 'inactive'
          setTimeout(() => {
            if (this.onstop) {
              this.onstop()
            }
          }, 10)
        }
      }

      window.MediaRecorder = MockMediaRecorder as any
      navigator.mediaDevices.getUserMedia = () => Promise.resolve(new MediaStream())
    })

    // Make recording attempt
    await page.click('.record-button')
    await page.waitForTimeout(200)
    await page.click('.record-button')
    
    // Wait for feedback - should show fallback message
    await page.waitForSelector('.feedback-section', { timeout: 5000 })
    
    // Should show fallback score and message
    await expect(page.locator('.score')).toContainText('75%')
    await expect(page.locator('.feedback-text')).toContainText('Unable to analyze')
  })

  test('should navigate back to home', async ({ page }) => {
    // Click back button
    await page.click('.back-button')
    
    // Should navigate back (assuming it goes to home or previous page)
    // The exact URL will depend on the router setup
    await page.waitForLoadState('networkidle')
    
    // Should not be on speaking page anymore
    await expect(page.locator('.speaking-content')).not.toBeVisible()
  })

  test('should complete all words and show completion', async ({ page }) => {
    await page.addInitScript(() => {
      class MockMediaRecorder {
        public state = 'inactive'
        public ondataavailable: ((event: BlobEvent) => void) | null = null
        public onstop: (() => void) | null = null

        constructor(public stream: MediaStream) {}

        start() {
          this.state = 'recording'
          setTimeout(() => {
            if (this.ondataavailable) {
              const blob = new Blob(['mock audio'], { type: 'audio/webm' })
              const event = new BlobEvent('dataavailable', { data: blob })
              this.ondataavailable(event)
            }
          }, 50)
        }

        stop() {
          this.state = 'inactive'
          setTimeout(() => {
            if (this.onstop) {
              this.onstop()
            }
          }, 10)
        }
      }

      window.MediaRecorder = MockMediaRecorder as any
      navigator.mediaDevices.getUserMedia = () => Promise.resolve(new MediaStream())

      // Mock alert
      window.alert = (message: string) => {
        console.log('Alert:', message)
      }
    })

    // Go through all words (there are 5 words in the test data)
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('.progress-indicator')).toContainText(`${i + 1}`)
      
      // Make attempt
      await page.click('.record-button')
      await page.waitForTimeout(200)
      await page.click('.record-button')
      await page.waitForSelector('.feedback-section', { timeout: 5000 })
      
      if (i < 4) {
        // Not the last word - click next
        await page.click('.next-button')
        await page.waitForTimeout(100)
      } else {
        // Last word - clicking next should show completion
        await page.click('.next-button')
        
        // Should navigate away or show completion message
        // The exact behavior depends on implementation
        await page.waitForLoadState('networkidle')
      }
    }
  })
})