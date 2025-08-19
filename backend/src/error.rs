use axum::{
    http::StatusCode,
    response::{
        IntoResponse,
        Response,
    },
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("JWT error: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Authentication required")]
    Unauthorized,

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Internal server error: {0}")]
    Internal(#[from] anyhow::Error),

    #[error("Internal server error: {0}")]
    InternalServerError(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message, error_code) = match &self {
            AppError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "Authentication required",
                "UNAUTHORIZED",
            ),
            AppError::BadRequest(_) => (StatusCode::BAD_REQUEST, "Bad request", "BAD_REQUEST"),
            AppError::Database(_) => {
                tracing::error!("Database error: {}", self);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error",
                    "DATABASE_ERROR",
                )
            }
            AppError::Jwt(_) => {
                tracing::error!("JWT error: {}", self);
                (
                    StatusCode::UNAUTHORIZED,
                    "Authentication failed",
                    "JWT_ERROR",
                )
            }
            AppError::Serialization(_) => {
                tracing::error!("Serialization error: {}", self);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error",
                    "SERIALIZATION_ERROR",
                )
            }
            AppError::Internal(_) => {
                tracing::error!("Internal error: {}", self);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error",
                    "INTERNAL_ERROR",
                )
            }
            AppError::InternalServerError(_) => {
                tracing::error!("Internal server error: {}", self);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error",
                    "INTERNAL_SERVER_ERROR",
                )
            }
        };

        let body = Json(json!({
            "error": error_message,
            "code": error_code,
            "details": match &self {
                AppError::BadRequest(msg) => Some(msg.as_str()),
                AppError::InternalServerError(msg) => Some(msg.as_str()),
                _ => None,
            }
        }));

        (status, body).into_response()
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
