import { vi, beforeEach } from 'vitest'

// Mock WebAuthn APIs for testing
class MockPublicKeyCredential {
  static isConditionalMediationAvailable = vi.fn().mockResolvedValue(true)
}

const mockCredentials = {
  create: vi.fn().mockResolvedValue({
    id: 'mock-credential-id',
    type: 'public-key',
    rawId: new ArrayBuffer(16),
    response: {
      attestationObject: new ArrayBuffer(32),
      clientDataJSON: new ArrayBuffer(32),
      getTransports: vi.fn().mockReturnValue(['usb', 'nfc']),
    },
    getClientExtensionResults: vi.fn().mockReturnValue({}),
  }),
  get: vi.fn().mockResolvedValue({
    id: 'mock-credential-id',
    type: 'public-key',
    rawId: new ArrayBuffer(16),
    response: {
      authenticatorData: new ArrayBuffer(32),
      signature: new ArrayBuffer(32),
      clientDataJSON: new ArrayBuffer(32),
      userHandle: null,
    },
    getClientExtensionResults: vi.fn().mockReturnValue({}),
  }),
}

// Set up global objects for WebAuthn
Object.defineProperty(global, 'window', {
  value: {
    ...global.window,
    PublicKeyCredential: MockPublicKeyCredential,
  },
  writable: true,
})

Object.defineProperty(global, 'navigator', {
  value: {
    ...global.navigator,
    credentials: mockCredentials,
  },
  writable: true,
})

// Also assign to window object
Object.defineProperty(window, 'PublicKeyCredential', {
  value: MockPublicKeyCredential,
  writable: true,
})

Object.defineProperty(window.navigator, 'credentials', {
  value: mockCredentials,
  writable: true,
})

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: vi.fn((_key: string) => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

const sessionStorageMock = {
  getItem: vi.fn((_key: string) => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  sessionStorageMock.getItem.mockReturnValue(null)
})
