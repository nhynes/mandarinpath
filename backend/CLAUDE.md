# Backend CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Rust backend server.

## Development Commands

All commands should be run from the `backend/` directory:

```bash
cd backend

# Development
cargo run           # Run the development server
cargo run --release # Run optimized production build

# Code Quality (REQUIRED after any changes)
cargo fmt           # Format Rust code with rustfmt
cargo clippy        # Run Rust linter with suggestions and warnings
cargo check         # Type check and verify compilation without building
cargo test          # Run all unit and integration tests

# Database
sqlx migrate run    # Run database migrations
```

## Architecture

### Core Components
- **Authentication**: WebAuthn/Passkey-based authentication with JWT tokens
- **Database**: SQLite with sqlx for async SQL operations
- **API**: Axum web framework with JSON endpoints
- **Security**: CSRF protection, rate limiting, session management

### Key Modules
- **`auth/`**: Authentication services (passkeys, JWT, sessions, recovery)
  - `passkey.rs`: WebAuthn passkey registration and authentication
  - `jwt.rs`: JWT token creation and validation
  - `session.rs`: Session management and cleanup
  - `recovery.rs`: TOTP and backup code recovery methods
- **`handlers/`**: HTTP request handlers
- **`middleware/`**: Security middleware (CSRF, rate limiting)
- **`models.rs`**: Database models and structs
- **`error.rs`**: Error handling and custom error types

### WebAuthn Implementation
- Uses `webauthn-rs` library for proper cryptographic verification
- Stores serialized `Passkey` objects from webauthn-rs in database
- Implements secure challenge-response flow with server-side state
- Supports conditional UI (usernameless) authentication
- Properly updates signature counters for replay attack protection

### Database Schema
- **users**: User accounts with optional email and display names
- **passkeys**: WebAuthn credentials with serialized public keys
- **sessions**: Active user sessions with device tracking
- **webauthn_challenges**: Temporary challenge storage for WebAuthn flows

### Security Features
- CSRF token validation
- Rate limiting on authentication endpoints
- Session-based authentication with JWT tokens
- Proper WebAuthn cryptographic verification
- Automatic cleanup of expired challenges and sessions

## Configuration
- Environment-based configuration via `.env` files
- WebAuthn relying party configuration (RP ID, origin, name)
- Database connection string
- JWT signing secrets
- CSRF and session secrets

## Development Notes
- Uses async/await throughout with tokio runtime
- Database migrations in `migrations/` directory
- Integration tests in `tests/` directory
- Follows Rust naming conventions and error handling patterns
- Includes comprehensive error types for different failure modes