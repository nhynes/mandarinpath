use mandarinpath_backend::db::Database;
use sqlx::Row;
use tempfile::TempDir;

#[tokio::test]
async fn test_database_creation_with_nested_path() {
    // Create a temporary directory
    let temp_dir = TempDir::new().unwrap();
    let nested_path = temp_dir.path().join("nested").join("dir").join("test.db");
    let db_url = format!("sqlite:{}", nested_path.display());

    // Verify parent directories don't exist yet
    assert!(!nested_path.parent().unwrap().exists());

    // Initialize database - should create directories and file
    let db = Database::new(&db_url).await.unwrap();

    // Verify database file exists
    assert!(nested_path.exists());

    // Verify we can use the database
    let pool = db.pool();

    // Test a simple query to ensure the database is working
    let result = sqlx::query("SELECT 1 as test")
        .fetch_one(pool)
        .await
        .unwrap();

    let test_value: i32 = result.get("test");
    assert_eq!(test_value, 1);
}

#[tokio::test]
async fn test_database_creation_in_current_dir() {
    // Create a temporary directory
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");
    let db_url = format!("sqlite:{}", db_path.display());

    // Initialize database
    let db = Database::new(&db_url).await.unwrap();

    // Verify database file exists
    assert!(db_path.exists());

    // Verify migrations ran by checking for tables
    let pool = db.pool();

    // Check that the users table exists (from migrations)
    let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        .fetch_one(pool)
        .await
        .unwrap();

    let table_name: String = result.get("name");
    assert_eq!(table_name, "users");
}

#[tokio::test]
async fn test_database_url_without_sqlite_prefix() {
    // Create a temporary directory
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");
    let db_url = db_path.to_string_lossy().to_string(); // No "sqlite:" prefix

    // Initialize database
    let db = Database::new(&db_url).await.unwrap();

    // Verify database file exists
    assert!(db_path.exists());

    // Verify we can use the database
    let pool = db.pool();
    let result = sqlx::query("SELECT 1 as test")
        .fetch_one(pool)
        .await
        .unwrap();

    let test_value: i32 = result.get("test");
    assert_eq!(test_value, 1);
}

#[tokio::test]
async fn test_database_creation_with_existing_directory() {
    // Create a temporary directory
    let temp_dir = TempDir::new().unwrap();
    let nested_dir = temp_dir.path().join("existing").join("dir");
    std::fs::create_dir_all(&nested_dir).unwrap();

    let db_path = nested_dir.join("test.db");
    let db_url = format!("sqlite:{}", db_path.display());

    // Initialize database in existing directory
    let db = Database::new(&db_url).await.unwrap();

    // Verify database file exists
    assert!(db_path.exists());

    // Verify we can use the database
    let pool = db.pool();
    let result = sqlx::query("SELECT 1 as test")
        .fetch_one(pool)
        .await
        .unwrap();

    let test_value: i32 = result.get("test");
    assert_eq!(test_value, 1);
}

#[tokio::test]
async fn test_database_migration_runs_correctly() {
    // Create a temporary directory
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");
    let db_url = format!("sqlite:{}", db_path.display());

    // Initialize database
    let db = Database::new(&db_url).await.unwrap();
    let pool = db.pool();

    // Verify all expected tables exist from migrations
    let tables = sqlx::query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .fetch_all(pool)
        .await
        .unwrap();

    let table_names: Vec<String> = tables
        .iter()
        .map(|row| row.get::<String, _>("name"))
        .collect();

    // Check for expected tables based on the migrations
    assert!(table_names.contains(&"users".to_string()));
    assert!(table_names.contains(&"sessions".to_string()));

    // Verify the _sqlx_migrations table exists (created by sqlx)
    assert!(table_names.contains(&"_sqlx_migrations".to_string()));
}

#[tokio::test]
async fn test_regression_database_file_not_found_error() {
    // This test reproduces the original issue:
    // "Error: error returned from database: (code: 14) unable to open database file"
    // This happens when the database file doesn't exist and directories aren't created

    let temp_dir = TempDir::new().unwrap();
    let deeply_nested_path = temp_dir
        .path()
        .join("deeply")
        .join("nested")
        .join("directories")
        .join("that")
        .join("dont")
        .join("exist")
        .join("test.db");

    let db_url = format!("sqlite:{}", deeply_nested_path.display());

    // Before our fix, this would fail with "unable to open database file"
    // After our fix, it should successfully create the database and all parent directories
    let db = Database::new(&db_url).await.expect(
        "Database creation should succeed even with deeply nested non-existent directories",
    );

    // Verify the database file was created
    assert!(
        deeply_nested_path.exists(),
        "Database file should be created"
    );

    // Verify all parent directories were created
    assert!(
        deeply_nested_path.parent().unwrap().exists(),
        "Parent directories should be created recursively"
    );

    // Verify the database is functional
    let pool = db.pool();
    let result = sqlx::query("SELECT 1 as test")
        .fetch_one(pool)
        .await
        .expect("Should be able to query the newly created database");

    let test_value: i32 = result.get("test");
    assert_eq!(test_value, 1);
}

#[tokio::test]
async fn test_database_creation_edge_cases() {
    // Test various edge cases that could cause database creation to fail

    // Test with file path that has spaces
    let temp_dir = TempDir::new().unwrap();
    let path_with_spaces = temp_dir.path().join("path with spaces").join("test db.db");
    let db_url = format!("sqlite:{}", path_with_spaces.display());

    let _db = Database::new(&db_url)
        .await
        .expect("Should handle paths with spaces");
    assert!(path_with_spaces.exists());

    // Test with current directory reference
    let current_dir_path = temp_dir.path().join("./test.db");
    let db_url = format!("sqlite:{}", current_dir_path.display());

    let _db = Database::new(&db_url)
        .await
        .expect("Should handle current directory reference");
    assert!(current_dir_path.exists());
}
