/**
 * Authentication service with username/password authentication
 */

import { apiClient } from './api'

interface User {
  id: string
  email: string
  display_name?: string
  created_at: string
}

interface RegisterRequest {
  email: string
  password: string
  display_name?: string
}

interface LoginRequest {
  email: string
  password: string
}

interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

/**
 * Authentication service with secure password authentication
 */
class AuthService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private user: User | null = null

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage()
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    // Ensure CSRF token is initialized
    await apiClient.initializeCsrf()

    const request: RegisterRequest = {
      email,
      password,
      display_name: displayName,
    }

    const response = await apiClient.post<AuthResponse>('/auth/register', request)

    // Store tokens and user info
    this.accessToken = response.access_token
    this.refreshToken = response.refresh_token
    this.user = response.user

    this.saveTokensToStorage()

    return response
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Ensure CSRF token is initialized
    await apiClient.initializeCsrf()

    const request: LoginRequest = {
      email,
      password,
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', request)

    // Store tokens and user info
    this.accessToken = response.access_token
    this.refreshToken = response.refresh_token
    this.user = response.user

    this.saveTokensToStorage()

    return response
  }

  /**
   * Get current user info from server
   */
  async getCurrentUserFromServer(): Promise<User> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    const user = await this.authenticatedRequest<User>('/auth/me')
    this.user = user
    this.saveTokensToStorage()
    return user
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    try {
      const response = await apiClient.post<{ access_token: string }>('/auth/refresh', {
        refresh_token: this.refreshToken,
      })

      this.accessToken = response.access_token
      this.saveTokensToStorage()
      return true
    } catch {
      // Refresh failed, clear all tokens
      this.clearTokens()
      return false
    }
  }

  /**
   * Logout from current session
   */
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        // Get session ID from JWT (simplified - in real app you'd decode JWT properly)
        await apiClient.post('/auth/logout', {
          session_id: 'current', // Backend extracts from token
        })
      }
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      this.clearTokens()
    }
  }

  /**
   * Logout from all sessions
   */
  async logoutAll(): Promise<void> {
    try {
      if (this.user?.id) {
        await apiClient.post('/auth/logout-all', {
          user_id: this.user.id,
        })
      }
    } catch (error) {
      console.warn('Logout all request failed:', error)
    } finally {
      this.clearTokens()
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.user
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.accessToken && this.user)
  }

  /**
   * Get access token for API requests
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Make authenticated API request
   */
  async authenticatedRequest<T>(endpoint: string): Promise<T> {
    try {
      // For now, just use GET requests. In the future, we can extend this
      // to support other HTTP methods with proper headers
      return await apiClient.get<T>(endpoint)
    } catch (error: unknown) {
      // If unauthorized, try to refresh token
      if ((error as { status?: number }).status === 401) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Retry with new token
          return await apiClient.get<T>(endpoint)
        }
      }
      throw error
    }
  }

  /**
   * Validate email format (client-side basic validation)
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password requirements (client-side)
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' }
    }
    return { valid: true }
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage(): void {
    if (this.accessToken) {
      localStorage.setItem('access_token', this.accessToken)
    }
    if (this.refreshToken) {
      localStorage.setItem('refresh_token', this.refreshToken)
    }
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user))
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('access_token')
    this.refreshToken = localStorage.getItem('refresh_token')

    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        this.user = JSON.parse(userStr)
      } catch {
        localStorage.removeItem('user')
      }
    }
  }

  /**
   * Clear all tokens and user data
   */
  private clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.user = null

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }
}

// Export singleton instance
export const authService = new AuthService()
export type { User, RegisterRequest, LoginRequest, AuthResponse }
