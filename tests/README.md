# MandarinPath E2E Tests

End-to-end tests for the MandarinPath Chinese language learning application. These tests validate the complete user journey across both frontend (Vue.js) and backend (Rust) components.

## Test Coverage

### Authentication Flow (`auth.spec.ts`)
- User registration and login
- CSRF token handling validation
- Session management
- Input validation and error handling
- Multi-session logout functionality

### Learning Tasks Flow (`learning-tasks.spec.ts`)
- Task preferences and settings
- Speaking, reading, and writing task sessions
- Progress tracking and statistics
- Task interruption and resumption
- Pinyin display preferences

### Navigation and Routing (`navigation.spec.ts`)
- Route protection and authentication guards
- Browser navigation (back/forward)
- Deep linking and URL handling
- 404 error handling

### API Integration (`api-integration.spec.ts`)
- Backend connectivity and health checks
- CSRF token lifecycle
- Error handling (network, server, rate limiting)
- Token refresh mechanisms
- Session persistence

## Setup and Usage

### Prerequisites
- Node.js 22+ and pnpm 9+
- Rust toolchain (for backend)
- Both frontend and backend dependencies installed

### Installation
```bash
# From project root
pnpm setup

# Or install test dependencies directly
cd tests
pnpm install
pnpm run install-deps  # Install Playwright browsers
```

### Running Tests

#### From Project Root
```bash
# Run all e2e tests
pnpm test:e2e

# Run with UI (interactive mode)
pnpm test:e2e:ui

# Run in headed mode (visible browser)
pnpm test:e2e:headed

# Debug mode (step through tests)
pnpm test:e2e:debug
```

#### From Tests Directory
```bash
cd tests

# Run all tests
pnpm test

# Run specific test file
pnpm test auth.spec.ts

# Run with UI
pnpm test:ui

# Debug specific test
pnpm test:debug auth.spec.ts
```

## Test Environment

### Servers
The test configuration automatically starts:
- **Backend**: Rust server on port 3000 with test database
- **Frontend**: Vite dev server on port 5173

### Test Data
- Each test creates isolated user data with timestamps
- Test database is cleaned between runs
- No persistent data between test sessions

### Browser Support
Tests run against:
- Chromium (Desktop Chrome)
- WebKit (Desktop Safari)  
- Firefox (Desktop Firefox)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Test Data Attributes

The tests expect specific `data-testid` attributes on UI elements:

### Authentication Modal
- `auth-modal`: Main modal container
- `email-input`: Email input field
- `password-input`: Password input field
- `display-name-input`: Display name input field
- `register-button`: Registration submit button
- `login-button`: Login submit button
- `error-message`: Error display area
- `email-error`: Email validation error
- `password-error`: Password validation error

### Navigation
- `dashboard-link`: Dashboard navigation
- `profile-link`: Profile navigation
- `user-menu`: User dropdown menu
- `logout-button`: Single session logout
- `logout-all-button`: All sessions logout
- `preferences-link`: User preferences link

### Learning Interface
- `start-speaking`: Start speaking practice
- `start-reading`: Start reading practice
- `start-writing`: Start writing practice
- `speaking-tasks`: Speaking tasks section
- `reading-tasks`: Reading tasks section
- `writing-tasks`: Writing tasks section
- `speaking-toggle`: Speaking preference toggle
- `reading-toggle`: Reading preference toggle
- `writing-toggle`: Writing preference toggle
- `pinyin-toggle`: Pinyin display toggle

### Task Views
- `current-word`: Word being practiced
- `pinyin`: Pinyin annotation
- `record-button`: Audio recording button
- `story-title`: Reading story title
- `story-content`: Story text content
- `character-display`: Character to practice
- `drawing-canvas`: Drawing/writing canvas
- `mark-complete`: Complete task button
- `finish-reading`: Complete reading task

### Statistics and Progress
- `words-learned`: Words learned count
- `current-streak`: Current streak display
- `study-time`: Study time statistics
- `tasks-completed`: Completed tasks count
- `recent-activity`: Recent activity section
- `activity-list`: Activity list container
- `activity-item`: Individual activity items

## Configuration

### Test Environment Variables
- `NODE_ENV=test`: Test environment flag
- `VITE_API_URL=http://localhost:3000/api`: API endpoint
- `RUST_LOG=info`: Backend logging level

### Timeouts
- Global test timeout: 30 seconds
- Expect timeout: 10 seconds
- Server startup timeout: 30 seconds

### Reports
- HTML report: `./test-results/html-report/`
- JUnit XML: `./test-results/results.xml`
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 5173 are available
2. **Database locks**: Stop any running backend instances
3. **Missing browsers**: Run `pnpm run install-deps`
4. **Test timeouts**: Check server startup logs in test output

### Debug Mode
Use debug mode to step through tests:
```bash
pnpm test:debug auth.spec.ts
```

### Logs
Server logs are available in test output when using `RUST_LOG=debug`.