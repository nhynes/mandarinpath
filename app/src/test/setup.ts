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

// Mock MediaRecorder for speech recording tests
class MockMediaRecorder {
  public state = 'inactive'
  public ondataavailable: ((event: BlobEvent) => void) | null = null
  public onstop: (() => void) | null = null

  constructor(public stream: MediaStream) {}

  start() {
    this.state = 'recording'
  }

  stop() {
    this.state = 'inactive'
    if (this.onstop) {
      this.onstop()
    }
  }
}

// Mock SpeechSynthesis for audio playback tests
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn().mockReturnValue([]),
}

class MockSpeechSynthesisUtterance {
  public text = ''
  public lang = ''
  public rate = 1

  constructor(text?: string) {
    if (text) this.text = text
  }
}

// Setup media and speech mocks
Object.defineProperty(global, 'MediaRecorder', {
  value: MockMediaRecorder,
  writable: true,
})

Object.defineProperty(global, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
})

Object.defineProperty(global, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  writable: true,
})

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(new MediaStream()),
  },
  writable: true,
})

// Mock URL methods for blob handling
Object.defineProperty(global.URL, 'createObjectURL', {
  value: vi.fn().mockReturnValue('mock-blob-url'),
  writable: true,
})

Object.defineProperty(global.URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
})

// Mock Blob constructor
global.Blob = vi.fn().mockImplementation((parts, options) => {
  return {
    size: parts?.length || 0,
    type: options?.type || '',
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    text: vi.fn().mockResolvedValue('mock blob content'),
    stream: vi.fn(),
    slice: vi.fn(),
  }
}) as typeof Blob

// Mock BlobEvent for MediaRecorder tests
global.BlobEvent = vi.fn().mockImplementation((type, eventInitDict) => {
  return {
    type,
    data: eventInitDict?.data || new Blob(),
  }
}) as typeof BlobEvent

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  sessionStorageMock.getItem.mockReturnValue(null)

  // Reset media mocks
  vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(new MediaStream())
  vi.mocked(URL.createObjectURL).mockReturnValue('mock-blob-url')
  mockSpeechSynthesis.speak.mockClear()
})
