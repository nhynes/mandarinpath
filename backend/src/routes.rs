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
        speech,
    },
    speech::{
        iflytek::IFlytekConfig,
        IFlytekService,
    },
};

pub fn create_routes(db: Database, config: Config) -> Router {
    // Initialize services
    let jwt_service = JwtService::new(&config);
    let session_service = SessionService::new(db.clone());
    let password_auth_service = PasswordAuthService::new(db.pool().clone());

    // Initialize speech evaluation service
    let iflytek_config = IFlytekConfig::default();
    let iflytek_service = IFlytekService::new(iflytek_config);

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

        // Speech evaluation routes
        .route("/speech/evaluate", post(speech::evaluate_speech))
        .route("/speech/health", get(speech::health_check))

        // Add service extensions
        .layer(Extension(password_auth_service))
        .layer(Extension(jwt_service))
        .layer(Extension(session_service))
        .layer(Extension(iflytek_service))
        .layer(Extension(config))
}
