use axum::{
    routing::{
        get,
        post,
    },
    Extension,
    Router,
};

use crate::{
    auth::{
        jwt::JwtService,
        password::PasswordAuthService,
        session::SessionService,
    },
    config::Config,
    db::Database,
    handlers::{
        auth,
        health,
    },
};

pub fn create_routes(db: Database, config: Config) -> Router {
    // Initialize services
    let jwt_service = JwtService::new(&config);
    let session_service = SessionService::new(db.clone());
    let password_auth_service = PasswordAuthService::new(db.pool().clone());

    Router::new()
        // Health checks
        .route("/health", get(health::health_check))
        .route("/ready", get(health::readiness_check))

        // Authentication routes
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/me", get(auth::me))
        .route("/auth/refresh", post(auth::refresh_token))
        .route("/auth/logout", post(auth::logout))
        .route("/auth/logout-all", post(auth::logout_all))

        // Add service extensions
        .layer(Extension(password_auth_service))
        .layer(Extension(jwt_service))
        .layer(Extension(session_service))
        .layer(Extension(config))
}
