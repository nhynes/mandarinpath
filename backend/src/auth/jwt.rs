use chrono::{
    Duration,
    Utc,
};
use jsonwebtoken::{
    decode,
    encode,
    DecodingKey,
    EncodingKey,
    Header,
    Validation,
};

use crate::{
    config::Config,
    error::{
        AppError,
        Result,
    },
    models::Claims,
};

#[derive(Clone)]
pub struct JwtService {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl JwtService {
    pub fn new(config: &Config) -> Self {
        let secret = config.jwt_secret().as_bytes();
        Self {
            encoding_key: EncodingKey::from_secret(secret),
            decoding_key: DecodingKey::from_secret(secret),
        }
    }

    pub fn create_access_token(&self, user_id: &str, session_id: &str) -> Result<String> {
        let now = Utc::now();
        let expires_at = now + Duration::minutes(15); // Short-lived access token

        let claims = Claims {
            sub: user_id.to_string(),
            exp: expires_at.timestamp(),
            iat: now.timestamp(),
            session_id: session_id.to_string(),
        };

        encode(&Header::default(), &claims, &self.encoding_key).map_err(|e| AppError::Jwt(e))
    }

    pub fn create_refresh_token(&self, user_id: &str, session_id: &str) -> Result<String> {
        let now = Utc::now();
        let expires_at = now + Duration::days(30); // Long-lived refresh token

        let claims = Claims {
            sub: user_id.to_string(),
            exp: expires_at.timestamp(),
            iat: now.timestamp(),
            session_id: session_id.to_string(),
        };

        encode(&Header::default(), &claims, &self.encoding_key).map_err(|e| AppError::Jwt(e))
    }

    pub fn verify_token(&self, token: &str) -> Result<Claims> {
        let validation = Validation::default();

        decode::<Claims>(token, &self.decoding_key, &validation)
            .map(|data| data.claims)
            .map_err(|e| AppError::Jwt(e))
    }

    pub fn refresh_access_token(&self, refresh_token: &str) -> Result<(String, Claims)> {
        let claims = self.verify_token(refresh_token)?;

        // Create new access token with same session
        let new_access_token = self.create_access_token(&claims.sub, &claims.session_id)?;

        Ok((new_access_token, claims))
    }
}
