use std::time::Duration;

use anyhow::Result;
use sqlx::{
    sqlite::{
        SqliteConnectOptions,
        SqlitePoolOptions,
    },
    SqlitePool,
};

#[derive(Debug, Clone)]
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        // Parse the database URL to extract the file path
        let db_path = database_url.strip_prefix("sqlite:").unwrap_or(database_url);

        // Create parent directories if they don't exist
        if let Some(parent) = std::path::Path::new(db_path).parent() {
            std::fs::create_dir_all(parent)?;
        }

        // Use SqliteConnectOptions to create database if it doesn't exist
        let connect_options = SqliteConnectOptions::new()
            .filename(db_path)
            .create_if_missing(true);

        let pool = SqlitePoolOptions::new()
            .max_connections(10)
            .acquire_timeout(Duration::from_secs(3))
            .connect_with(connect_options)
            .await?;

        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }

    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
}
