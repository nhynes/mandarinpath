use axum::{
    http::StatusCode,
    response::Json,
};
use serde_json::{
    json,
    Value,
};

pub async fn health_check() -> Result<Json<Value>, StatusCode> {
    Ok(Json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

pub async fn readiness_check() -> Result<Json<Value>, StatusCode> {
    // In a real implementation, you'd check database connectivity, etc.
    Ok(Json(json!({
        "status": "ready",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}
