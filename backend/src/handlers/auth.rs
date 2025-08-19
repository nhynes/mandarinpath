use axum::{
    extract::{
        Extension,
        Json,
    },
    http::HeaderMap,
    response::Json as ResponseJson,
};
use serde_json::{
    json,
    Value,
};

use crate::{
    auth::{
        jwt::JwtService,
        password::{
            AuthResponse,
            LoginRequest,
            PasswordAuthService,
            RegisterRequest,
        },
        session::SessionService,
    },
    config::Config,
    error::Result,
};

pub async fn register(
    Extension(password_auth): Extension<PasswordAuthService>,
    Extension(jwt_service): Extension<JwtService>,
    Extension(session_service): Extension<SessionService>,
    Extension(config): Extension<Config>,
    headers: HeaderMap,
    Json(request): Json<RegisterRequest>,
) -> Result<ResponseJson<AuthResponse>> {
    if config.debug_mode {
        tracing::debug!("Registration attempt for email: {}", request.email);
        tracing::debug!("Request headers: {:?}", headers);
    }

    // Get IP address and user agent for session tracking
    let ip_address = headers
        .get("x-forwarded-for")
        .or_else(|| headers.get("x-real-ip"))
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string());

    let user_agent = headers
        .get("user-agent")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string());

    // Register user
    let user = password_auth.register(request).await?;

    // Create session
    let session = session_service
        .create_session(&user.id, ip_address, user_agent)
        .await?;

    // Generate JWT tokens
    let access_token = jwt_service.create_access_token(&user.id, &session.id)?;
    let refresh_token = jwt_service.create_refresh_token(&user.id, &session.id)?;

    Ok(ResponseJson(AuthResponse {
        user: user.to_public(),
        access_token,
        refresh_token,
    }))
}

pub async fn login(
    Extension(password_auth): Extension<PasswordAuthService>,
    Extension(jwt_service): Extension<JwtService>,
    Extension(session_service): Extension<SessionService>,
    headers: HeaderMap,
    Json(request): Json<LoginRequest>,
) -> Result<ResponseJson<AuthResponse>> {
    // Get IP address and user agent for session tracking
    let ip_address = headers
        .get("x-forwarded-for")
        .or_else(|| headers.get("x-real-ip"))
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string());

    let user_agent = headers
        .get("user-agent")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string());

    // Authenticate user
    let user = password_auth.login(request).await?;

    // Create session
    let session = session_service
        .create_session(&user.id, ip_address, user_agent)
        .await?;

    // Generate JWT tokens
    let access_token = jwt_service.create_access_token(&user.id, &session.id)?;
    let refresh_token = jwt_service.create_refresh_token(&user.id, &session.id)?;

    Ok(ResponseJson(AuthResponse {
        user: user.to_public(),
        access_token,
        refresh_token,
    }))
}

pub async fn refresh_token(
    Extension(jwt_service): Extension<JwtService>,
    Extension(session_service): Extension<SessionService>,
    Json(payload): Json<Value>,
) -> Result<ResponseJson<Value>> {
    let refresh_token = payload
        .get("refresh_token")
        .and_then(|v| v.as_str())
        .ok_or_else(|| crate::error::AppError::BadRequest("Missing refresh token".to_string()))?;

    let (new_access_token, claims) = jwt_service.refresh_access_token(refresh_token)?;

    // Verify session still exists
    let session = session_service.get_session(&claims.session_id).await?;
    if session.is_none() {
        return Err(crate::error::AppError::Unauthorized);
    }

    // Update session activity
    session_service
        .update_session_activity(&claims.session_id)
        .await?;

    Ok(ResponseJson(json!({
        "access_token": new_access_token
    })))
}

pub async fn logout(
    Extension(session_service): Extension<SessionService>,
    Json(payload): Json<Value>,
) -> Result<ResponseJson<Value>> {
    let session_id = payload
        .get("session_id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| crate::error::AppError::BadRequest("Missing session_id".to_string()))?;

    session_service.revoke_session(session_id).await?;
    Ok(ResponseJson(json!({"success": true})))
}

pub async fn logout_all(
    Extension(session_service): Extension<SessionService>,
    Json(payload): Json<Value>,
) -> Result<ResponseJson<Value>> {
    let user_id = payload
        .get("user_id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| crate::error::AppError::BadRequest("Missing user_id".to_string()))?;

    session_service.revoke_all_user_sessions(user_id).await?;
    Ok(ResponseJson(json!({"success": true})))
}

pub async fn me(
    Extension(password_auth): Extension<PasswordAuthService>,
    Extension(jwt_service): Extension<JwtService>,
    headers: HeaderMap,
) -> Result<ResponseJson<Value>> {
    // Extract token from Authorization header
    let auth_header = headers
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "))
        .ok_or_else(|| crate::error::AppError::Unauthorized)?;

    // Verify token
    let claims = jwt_service.verify_token(auth_header)?;

    // Get user
    let user = password_auth
        .get_user_by_id(&claims.sub)
        .await?
        .ok_or_else(|| crate::error::AppError::Unauthorized)?;

    Ok(ResponseJson(json!(user.to_public())))
}
