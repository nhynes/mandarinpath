use std::time::Duration;

use anyhow::Result;
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash,
        PasswordHasher,
        PasswordVerifier,
        SaltString,
    },
    Argon2,
};
use secrecy::{
    ExposeSecret,
    Secret,
};
use serde::{
    Deserialize,
    Serialize,
};
use sqlx::SqlitePool;
use thiserror::Error;
use tokio::time::sleep;

use crate::{
    error::AppError,
    models::{
        PublicUser,
        User,
    },
};

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Invalid credentials")]
    InvalidCredentials,
    #[error("User already exists")]
    UserAlreadyExists,
    #[error("Invalid email format")]
    InvalidEmail,
    #[error("Password too short (minimum 8 characters)")]
    PasswordTooShort,
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Password hashing error")]
    PasswordHash,
}

impl From<AuthError> for AppError {
    fn from(err: AuthError) -> Self {
        match err {
            AuthError::InvalidCredentials => AppError::Unauthorized,
            AuthError::UserAlreadyExists => AppError::BadRequest("User already exists".to_string()),
            AuthError::InvalidEmail => AppError::BadRequest("Invalid email format".to_string()),
            AuthError::PasswordTooShort => {
                AppError::BadRequest("Password must be at least 8 characters".to_string())
            }
            AuthError::Database(e) => {
                AppError::InternalServerError(format!("Database error: {}", e))
            }
            AuthError::PasswordHash => {
                AppError::InternalServerError("Password hashing error".to_string())
            }
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub display_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: PublicUser,
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Clone)]
pub struct PasswordAuthService {
    db: SqlitePool,
    argon2: Argon2<'static>,
}

impl PasswordAuthService {
    pub fn new(db: SqlitePool) -> Self {
        // Configure Argon2 with secure parameters
        // These are OWASP recommended parameters for 2024
        let argon2 = Argon2::new(
            argon2::Algorithm::Argon2id,
            argon2::Version::V0x13,
            argon2::Params::new(46080, 1, 1, None).unwrap(), // 45MB memory, 1 iteration, 1 thread
        );

        Self { db, argon2 }
    }

    /// Hash a password using Argon2id
    pub fn hash_password(&self, password: &Secret<String>) -> Result<String, AuthError> {
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = self
            .argon2
            .hash_password(password.expose_secret().as_bytes(), &salt)
            .map_err(|_| AuthError::PasswordHash)?
            .to_string();
        Ok(password_hash)
    }

    /// Verify a password against a hash with timing attack protection
    pub async fn verify_password(
        &self,
        password: &Secret<String>,
        hash: &str,
    ) -> Result<bool, AuthError> {
        let password = password.clone();
        let hash = hash.to_string();

        // Run password verification in a blocking task to avoid blocking the async runtime
        let is_valid = tokio::task::spawn_blocking(move || -> Result<bool, AuthError> {
            let parsed_hash = PasswordHash::new(&hash).map_err(|_| AuthError::PasswordHash)?;
            let is_valid = Argon2::default()
                .verify_password(password.expose_secret().as_bytes(), &parsed_hash)
                .is_ok();
            Ok(is_valid)
        })
        .await
        .map_err(|_| AuthError::PasswordHash)??;

        // Constant-time delay to prevent timing attacks on non-existent users
        if !is_valid {
            sleep(Duration::from_millis(100)).await;
        }

        Ok(is_valid)
    }

    /// Validate email format
    fn validate_email(email: &str) -> Result<(), AuthError> {
        if email.is_empty() || !email.contains('@') || !email.contains('.') {
            return Err(AuthError::InvalidEmail);
        }
        Ok(())
    }

    /// Validate password requirements
    fn validate_password(password: &str) -> Result<(), AuthError> {
        if password.len() < 8 {
            return Err(AuthError::PasswordTooShort);
        }
        Ok(())
    }

    /// Register a new user
    pub async fn register(&self, request: RegisterRequest) -> Result<User, AuthError> {
        // Validate input
        Self::validate_email(&request.email)?;
        Self::validate_password(&request.password)?;

        // Check if user already exists
        let existing_user = sqlx::query_as::<_, User>(
            "SELECT id, created_at, updated_at, email, display_name, password_hash FROM users WHERE email = ?",
        )
        .bind(&request.email)
        .fetch_optional(&self.db)
        .await?;

        if existing_user.is_some() {
            return Err(AuthError::UserAlreadyExists);
        }

        // Hash password
        let password_hash = self.hash_password(&Secret::new(request.password))?;

        // Create user
        let user = User::new(request.email, password_hash, request.display_name);

        // Insert into database
        sqlx::query(
            "INSERT INTO users (id, created_at, updated_at, email, display_name, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(&user.id)
        .bind(&user.created_at)
        .bind(&user.updated_at)
        .bind(&user.email)
        .bind(&user.display_name)
        .bind(&user.password_hash)
        .execute(&self.db)
        .await?;

        Ok(user)
    }

    /// Authenticate a user
    pub async fn login(&self, request: LoginRequest) -> Result<User, AuthError> {
        // Get user by email
        let user = sqlx::query_as::<_, User>(
            "SELECT id, created_at, updated_at, email, display_name, password_hash FROM users WHERE email = ?",
        )
        .bind(&request.email)
        .fetch_optional(&self.db)
        .await?;

        match user {
            Some(user) => {
                // Verify password
                let is_valid = self
                    .verify_password(&Secret::new(request.password), &user.password_hash)
                    .await?;

                if is_valid {
                    Ok(user)
                } else {
                    Err(AuthError::InvalidCredentials)
                }
            }
            None => {
                // Perform dummy hash to prevent timing attacks
                let _ = self
                    .verify_password(
                        &Secret::new(request.password),
                        "$argon2id$v=19$m=46080,t=1,p=1$dummy$dummy",
                    )
                    .await;
                Err(AuthError::InvalidCredentials)
            }
        }
    }

    /// Get user by ID
    pub async fn get_user_by_id(&self, user_id: &str) -> Result<Option<User>, AuthError> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, created_at, updated_at, email, display_name, password_hash FROM users WHERE id = ?",
        )
        .bind(user_id)
        .fetch_optional(&self.db)
        .await?;

        Ok(user)
    }
}
