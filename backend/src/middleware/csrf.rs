use std::collections::HashMap;
use std::sync::{
    Arc,
    Mutex,
};
use std::time::{
    Duration,
    Instant,
};

use axum::{
    extract::Request,
    http::{
        HeaderValue,
        Method,
        StatusCode,
    },
    response::Response,
};
use rand::Rng;
use tower::{
    Layer,
    Service,
};

const CSRF_HEADER: &str = "x-csrf-token";
const CSRF_COOKIE: &str = "csrf-token";
const TOKEN_LENGTH: usize = 32;
const TOKEN_LIFETIME: Duration = Duration::from_secs(3600); // 1 hour

#[derive(Clone)]
pub struct CsrfLayer {
    tokens: Arc<Mutex<HashMap<String, Instant>>>,
}

impl CsrfLayer {
    pub fn new() -> Self {
        Self {
            tokens: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn generate_token(&self) -> String {
        let mut rng = rand::thread_rng();
        let token: String = (0..TOKEN_LENGTH)
            .map(|_| {
                let chars = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                chars[rng.gen_range(0..chars.len())] as char
            })
            .collect();

        if let Ok(mut tokens) = self.tokens.lock() {
            tokens.insert(token.clone(), Instant::now());
            // Clean up expired tokens
            tokens.retain(|_, &mut created| created.elapsed() < TOKEN_LIFETIME);
        }

        token
    }

    fn validate_token(&self, token: &str) -> bool {
        if let Ok(mut tokens) = self.tokens.lock() {
            if let Some(&created) = tokens.get(token) {
                if created.elapsed() < TOKEN_LIFETIME {
                    // Remove token after use (single use)
                    tokens.remove(token);
                    return true;
                }
                // Remove expired token
                tokens.remove(token);
            }
        }
        false
    }
}

impl<S> Layer<S> for CsrfLayer {
    type Service = CsrfService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        CsrfService {
            inner,
            csrf_layer: self.clone(),
        }
    }
}

#[derive(Clone)]
pub struct CsrfService<S> {
    inner: S,
    csrf_layer: CsrfLayer,
}

impl<S> Service<Request> for CsrfService<S>
where
    S: Service<Request, Response = Response> + Clone + Send + 'static,
    S::Future: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>> + Send>,
    >;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request) -> Self::Future {
        let csrf_layer = self.csrf_layer.clone();
        let mut inner = self.inner.clone();

        Box::pin(async move {
            // Generate CSRF token for GET requests
            if req.method() == Method::GET {
                let token = csrf_layer.generate_token();
                let mut response = inner.call(req).await?;

                // Add CSRF token as cookie
                // Note: CSRF tokens should NOT be HttpOnly so frontend JS can read them
                // Only use Secure flag in production (HTTPS)
                let secure_flag = if cfg!(debug_assertions) {
                    ""
                } else {
                    "; Secure"
                };
                let cookie_value = format!(
                    "{}={}; Path=/; SameSite=Strict{}",
                    CSRF_COOKIE, token, secure_flag
                );
                response.headers_mut().insert(
                    axum::http::header::SET_COOKIE,
                    HeaderValue::from_str(&cookie_value)
                        .unwrap_or_else(|_| HeaderValue::from_static("")),
                );

                return Ok(response);
            }

            // Validate CSRF token for state-changing requests
            if matches!(
                req.method(),
                &Method::POST | &Method::PUT | &Method::DELETE | &Method::PATCH
            ) {
                let csrf_token = req.headers().get(CSRF_HEADER).and_then(|h| h.to_str().ok());

                if let Some(token) = csrf_token {
                    if !csrf_layer.validate_token(token) {
                        tracing::warn!("Invalid CSRF token provided: {}", token);
                        let mut response =
                            Response::new(axum::body::Body::from("CSRF token invalid"));
                        *response.status_mut() = StatusCode::FORBIDDEN;
                        return Ok(response);
                    }
                } else {
                    tracing::warn!(
                        "CSRF token missing for {} request to {:?}",
                        req.method(),
                        req.uri()
                    );
                    let mut response = Response::new(axum::body::Body::from("CSRF token required"));
                    *response.status_mut() = StatusCode::FORBIDDEN;
                    return Ok(response);
                }
            }

            inner.call(req).await
        })
    }
}
