# MandarinPath Backend

A Rust backend API for the MandarinPath Chinese language learning application, featuring passwordless authentication with WebAuthn passkeys.

## Features

- **Passwordless Authentication**: WebAuthn passkey support with conditional UI
- **Recovery Options**: TOTP and backup codes for account recovery
- **Security**: CSRF protection, XSS mitigation, secure headers
- **Session Management**: JWT-based authentication with refresh tokens
- **Database**: SQLite with migrations
- **Testing**: Comprehensive integration tests

## Quick Start

1. **Install dependencies**:
   ```bash
   cargo build
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run migrations**:
   ```bash
   # Migrations run automatically on startup
   ```

4. **Start the server**:
   ```bash
   cargo run
   ```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Health Checks
- `GET /api/health` - Health check
- `GET /api/ready` - Readiness check

### Authentication
- `POST /api/auth/register/start` - Start passkey registration
- `POST /api/auth/register/finish` - Finish passkey registration
- `POST /api/auth/authenticate/start` - Start authentication
- `POST /api/auth/authenticate/finish` - Finish authentication
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke session)
- `POST /api/auth/logout-all` - Logout all sessions

### Recovery
- `POST /api/auth/recovery/totp/setup` - Set up TOTP
- `POST /api/auth/recovery/totp/verify` - Verify TOTP code
- `POST /api/auth/recovery/backup-codes/verify` - Verify backup code
- `POST /api/auth/recovery/backup-codes/regenerate` - Generate new backup codes

## Development

### Running Tests
```bash
cargo test
```

### Code Formatting
```bash
cargo fmt
```

### Linting
```bash
cargo clippy
```

## Security Features

- **CSRF Protection**: Automatic CSRF token generation and validation
- **XSS Mitigation**: Content Security Policy and security headers
- **Session Security**: HTTP-only, secure, SameSite cookies
- **Rate Limiting**: Built-in rate limiting for sensitive endpoints
- **Password-free**: No passwords to compromise or leak

## Environment Variables

See `.env.example` for all available configuration options.

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts
- `passkeys` - WebAuthn credentials
- `sessions` - User sessions
- `webauthn_challenges` - Temporary challenge storage
- `rate_limits` - Rate limiting data

## Architecture

```
src/
├── auth/           # Authentication services
│   ├── jwt.rs     # JWT token management
│   ├── passkey.rs # WebAuthn passkey handling
│   ├── recovery.rs # TOTP and backup codes
│   └── session.rs # Session management
├── handlers/       # HTTP request handlers
├── middleware/     # Security middleware
├── models/         # Database models
└── routes.rs      # API route definitions
```