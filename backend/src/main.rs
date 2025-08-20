mod auth;
mod config;
mod db;
mod error;
mod handlers;
mod middleware;
mod models;
mod routes;
mod speech;

use std::net::SocketAddr;

use anyhow::Result;
use axum::{
    http::Method,
    Router,
};
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    trace::TraceLayer,
};
use tracing_subscriber::{
    layer::SubscriberExt,
    util::SubscriberInitExt,
};

use crate::{
    config::Config,
    db::Database,
    middleware::{
        csrf::CsrfLayer,
        security::SecurityLayer,
    },
    routes::create_routes,
};

#[tokio::main]
async fn main() -> Result<()> {
    let config = Config::from_args()?;

    // Configure logging based on verbosity
    let log_level = match config.verbosity {
        0 => "mandarinpath_backend=info,tower_http=warn",
        1 => "mandarinpath_backend=debug,tower_http=info",
        2 => "mandarinpath_backend=debug,tower_http=debug",
        _ => "mandarinpath_backend=trace,tower_http=debug,sqlx=debug",
    };

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| log_level.into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    if config.debug_mode {
        tracing::info!("Debug mode enabled");
    }
    tracing::info!("Log level: {}", log_level);

    let db = Database::new(&config.database_url).await?;

    let cors = CorsLayer::new()
        .allow_origin(config.frontend_url.parse::<axum::http::HeaderValue>()?)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
            axum::http::header::HeaderName::from_static("x-csrf-token"),
        ])
        .allow_credentials(true);

    let app = Router::new()
        .nest("/api", create_routes(db.clone(), config.clone()))
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer(cors)
                .layer(SecurityLayer::new())
                .layer(CsrfLayer::new()),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
