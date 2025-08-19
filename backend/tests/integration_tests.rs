use axum::{
    http::{
        HeaderName,
        HeaderValue,
        Method,
    },
    Router,
};
use axum_test::TestServer;
use mandarinpath_backend::*;
use serde_json::json;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    trace::TraceLayer,
};

fn create_test_app(db: db::Database, config: config::Config) -> Router {
    // Create CORS layer (same as main.rs)
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .frontend_url
                .parse::<axum::http::HeaderValue>()
                .unwrap(),
        )
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
            axum::http::header::HeaderName::from_static("x-csrf-token"),
        ])
        .allow_credentials(true);

    // Create complete app with middleware (same as main.rs)
    Router::new()
        .nest("/api", routes::create_routes(db, config))
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer(cors)
                .layer(middleware::security::SecurityLayer::new())
                .layer(middleware::csrf::CsrfLayer::new()),
        )
}

#[tokio::test]
async fn test_health_endpoints() {
    let config = config::Config::from_env().expect("Failed to load config");
    let db = db::Database::new(&config.database_url)
        .await
        .expect("Failed to connect to database");

    let app = create_test_app(db, config);
    let server = TestServer::new(app).unwrap();

    // Test health check
    let response = server.get("/api/health").await;
    response.assert_status_ok();
    response.assert_json(&json!({
        "status": "healthy"
    }));

    // Test readiness check
    let response = server.get("/api/ready").await;
    response.assert_status_ok();
    response.assert_json(&json!({
        "status": "ready"
    }));
}

#[tokio::test]
async fn test_cors_configuration() {
    let config = config::Config::from_env().expect("Failed to load config");
    let db = db::Database::new(&config.database_url)
        .await
        .expect("Failed to connect to database");

    let app = create_test_app(db, config.clone());
    let server = TestServer::new(app).unwrap();

    // Test CORS preflight request
    let response = server
        .method(Method::OPTIONS, "/api/health")
        .add_header(
            HeaderName::from_static("origin"),
            HeaderValue::from_str(&config.frontend_url).unwrap(),
        )
        .add_header(
            HeaderName::from_static("access-control-request-method"),
            HeaderValue::from_static("GET"),
        )
        .add_header(
            HeaderName::from_static("access-control-request-headers"),
            HeaderValue::from_static("content-type"),
        )
        .await;

    response.assert_status_ok();

    // Check CORS headers are present
    let headers = response.headers();
    assert!(headers.contains_key("access-control-allow-origin"));
    assert!(headers.contains_key("access-control-allow-credentials"));
    assert!(headers.contains_key("access-control-allow-methods"));
    assert!(headers.contains_key("access-control-allow-headers"));

    // Verify origin is allowed
    assert_eq!(
        headers.get("access-control-allow-origin").unwrap(),
        &config.frontend_url
    );
    assert_eq!(
        headers.get("access-control-allow-credentials").unwrap(),
        "true"
    );
}

#[tokio::test]
async fn test_cors_on_error_responses() {
    let config = config::Config::from_env().expect("Failed to load config");
    let db = db::Database::new(&config.database_url)
        .await
        .expect("Failed to connect to database");

    let app = create_test_app(db, config.clone());
    let server = TestServer::new(app).unwrap();

    // Test that CORS headers are present even on error responses (like 404 errors)
    let response = server
        .post("/api/nonexistent")
        .add_header(
            HeaderName::from_static("origin"),
            HeaderValue::from_str(&config.frontend_url).unwrap(),
        )
        .add_header(
            HeaderName::from_static("content-type"),
            HeaderValue::from_static("application/json"),
        )
        .json(&json!({}))
        .await;

    // Should get 404 for nonexistent endpoint (or 403 due to CSRF)
    assert!(response.status_code().is_client_error());

    // But CORS headers should still be present
    let headers = response.headers();
    assert!(headers.contains_key("access-control-allow-origin"));
    assert!(headers.contains_key("access-control-allow-credentials"));

    // Verify origin is allowed
    assert_eq!(
        headers.get("access-control-allow-origin").unwrap(),
        &config.frontend_url
    );
    assert_eq!(
        headers.get("access-control-allow-credentials").unwrap(),
        "true"
    );
}

#[tokio::test]
async fn test_jwt_service() {
    let config = config::Config::from_env().expect("Failed to load config");
    let jwt_service = auth::jwt::JwtService::new(&config);

    let user_id = "test-user-id";
    let session_id = "test-session-id";

    // Test access token creation and verification
    let access_token = jwt_service
        .create_access_token(user_id, session_id)
        .unwrap();
    let claims = jwt_service.verify_token(&access_token).unwrap();

    assert_eq!(claims.sub, user_id);
    assert_eq!(claims.session_id, session_id);

    // Test refresh token creation and verification
    let refresh_token = jwt_service
        .create_refresh_token(user_id, session_id)
        .unwrap();
    let refresh_claims = jwt_service.verify_token(&refresh_token).unwrap();

    assert_eq!(refresh_claims.sub, user_id);
    assert_eq!(refresh_claims.session_id, session_id);

    // Test token refresh
    let (new_access_token, new_claims) = jwt_service.refresh_access_token(&refresh_token).unwrap();
    assert_eq!(new_claims.sub, user_id);
    assert_eq!(new_claims.session_id, session_id);
    assert_ne!(new_access_token, access_token); // Should be different
}

#[tokio::test]
async fn test_session_service() {
    let config = config::Config::from_env().expect("Failed to load config");
    let db = db::Database::new(&config.database_url)
        .await
        .expect("Failed to connect to database");
    let session_service = auth::session::SessionService::new(db);

    let user_id = "test-user-id";
    let ip_address = Some("127.0.0.1".to_string());
    let user_agent = Some("TestAgent/1.0".to_string());

    // Test session creation
    let session = session_service
        .create_session(user_id, ip_address.clone(), user_agent.clone())
        .await
        .unwrap();

    assert_eq!(session.user_id, user_id);
    assert_eq!(session.ip_address, ip_address);
    assert_eq!(session.user_agent, user_agent);

    // Test session retrieval
    let retrieved_session = session_service.get_session(&session.id).await.unwrap();

    assert!(retrieved_session.is_some());
    let retrieved_session = retrieved_session.unwrap();
    assert_eq!(retrieved_session.id, session.id);
    assert_eq!(retrieved_session.user_id, user_id);

    // Test session activity update
    session_service
        .update_session_activity(&session.id)
        .await
        .unwrap();

    // Test session revocation
    session_service.revoke_session(&session.id).await.unwrap();

    // Session should no longer exist
    let revoked_session = session_service.get_session(&session.id).await.unwrap();

    assert!(revoked_session.is_none());
}
