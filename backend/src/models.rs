use chrono::{
    DateTime,
    NaiveDateTime,
    Utc,
};
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub email: String,
    pub display_name: Option<String>,
    #[serde(skip_serializing)]
    pub password_hash: String,
}

impl User {
    pub fn new(email: String, password_hash: String, display_name: Option<String>) -> Self {
        let now = Utc::now().naive_utc();
        Self {
            id: Uuid::new_v4().to_string(),
            created_at: now,
            updated_at: now,
            email,
            display_name,
            password_hash,
        }
    }

    /// Create user response without sensitive data
    pub fn to_public(&self) -> PublicUser {
        PublicUser {
            id: self.id.clone(),
            email: self.email.clone(),
            display_name: self.display_name.clone(),
            created_at: self.created_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicUser {
    pub id: String,
    pub email: String,
    pub display_name: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Session {
    pub id: String,
    pub user_id: String,
    pub created_at: NaiveDateTime,
    pub expires_at: NaiveDateTime,
    pub last_used_at: NaiveDateTime,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

impl Session {
    pub fn new(user_id: String, expires_at: DateTime<Utc>) -> Self {
        let now = Utc::now().naive_utc();
        Self {
            id: Uuid::new_v4().to_string(),
            user_id,
            created_at: now,
            expires_at: expires_at.naive_utc(),
            last_used_at: now,
            ip_address: None,
            user_agent: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: i64,
    pub iat: i64,
    pub session_id: String,
}
