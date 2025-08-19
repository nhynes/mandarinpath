/**
 * API client for MandarinPath backend
 * Uses native fetch and WebAuthn APIs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
  details?: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Base API client with CSRF and session management
 */
class ApiClient {
  private csrfToken: string | null = null

  /**
   * Make an HTTP request with automatic CSRF handling
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    // Debug logging
    if (import.meta.env.DEV) {
      console.debug(`API ${options.method || 'GET'} ${url}`)
    }

    // Add CSRF token for state-changing requests
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add existing headers
    if (options.headers) {
      const existingHeaders = new Headers(options.headers)
      for (const [key, value] of existingHeaders) {
        headers[key] = value
      }
    }

    if (
      this.csrfToken &&
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || '')
    ) {
      headers['x-csrf-token'] = this.csrfToken
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session management
    })

    // Update CSRF token from document cookies if available
    // Note: set-cookie headers are not accessible in browser JavaScript for security
    if (typeof document !== 'undefined') {
      const csrfMatch = document.cookie.match(/csrf-token=([^;]+)/)
      if (csrfMatch) {
        this.csrfToken = csrfMatch[1]
      }
    }

    // Handle non-JSON responses (like for health checks)
    const contentType = response.headers.get('content-type')
    let data: unknown

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const apiResponse = data as ApiResponse<never>

      // Debug logging for errors
      if (import.meta.env.DEV) {
        console.error(
          `API Error ${response.status} for ${options.method || 'GET'} ${url}:`,
          apiResponse,
        )
      }

      throw new ApiError(
        apiResponse.error || `Request failed with status ${response.status}`,
        response.status,
        apiResponse.code,
        apiResponse.details,
      )
    }

    return data as T
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Initialize CSRF token by making a GET request
   */
  async initializeCsrf(): Promise<void> {
    try {
      await this.get('/health')
    } catch (error) {
      // Ignore errors during CSRF initialization
      console.warn('Failed to initialize CSRF token:', error)
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export { ApiError }
export type { ApiResponse }
