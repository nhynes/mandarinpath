use chrono::{
    Duration,
    Utc,
};

use crate::{
    db::Database,
    error::Result,
    models::Session,
};

#[derive(Clone)]
pub struct SessionService {
    db: Database,
}

impl SessionService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub async fn create_session(
        &self,
        user_id: &str,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Result<Session> {
        let expires_at = Utc::now() + Duration::days(30);
        let mut session = Session::new(user_id.to_string(), expires_at);
        session.ip_address = ip_address;
        session.user_agent = user_agent;

        sqlx::query!(
            r#"
            INSERT INTO sessions (id, user_id, created_at, expires_at, last_used_at, ip_address, user_agent)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            "#,
            session.id,
            session.user_id,
            session.created_at,
            session.expires_at,
            session.last_used_at,
            session.ip_address,
            session.user_agent
        )
        .execute(self.db.pool())
        .await?;

        Ok(session)
    }

    pub async fn get_session(&self, session_id: &str) -> Result<Option<Session>> {
        let now = Utc::now().naive_utc();
        let session = sqlx::query_as!(
            Session,
            r#"
            SELECT id as "id!", user_id as "user_id!", created_at, expires_at, last_used_at, ip_address, user_agent
            FROM sessions
            WHERE id = ?1 AND expires_at > ?2
            "#,
            session_id,
            now
        )
        .fetch_optional(self.db.pool())
        .await?;

        Ok(session)
    }

    pub async fn update_session_activity(&self, session_id: &str) -> Result<()> {
        let now = Utc::now().naive_utc();
        sqlx::query!(
            "UPDATE sessions SET last_used_at = ?1 WHERE id = ?2",
            now,
            session_id
        )
        .execute(self.db.pool())
        .await?;

        Ok(())
    }

    pub async fn revoke_session(&self, session_id: &str) -> Result<()> {
        sqlx::query!("DELETE FROM sessions WHERE id = ?1", session_id)
            .execute(self.db.pool())
            .await?;

        Ok(())
    }

    pub async fn revoke_all_user_sessions(&self, user_id: &str) -> Result<()> {
        sqlx::query!("DELETE FROM sessions WHERE user_id = ?1", user_id)
            .execute(self.db.pool())
            .await?;

        Ok(())
    }
}
