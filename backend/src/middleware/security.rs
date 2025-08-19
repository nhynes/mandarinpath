use axum::{
    extract::Request,
    http::{
        HeaderName,
        HeaderValue,
    },
    response::Response,
};
use tower::{
    Layer,
    Service,
};

#[derive(Clone)]
pub struct SecurityLayer;

impl SecurityLayer {
    pub fn new() -> Self {
        Self
    }
}

impl<S> Layer<S> for SecurityLayer {
    type Service = SecurityService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        SecurityService { inner }
    }
}

#[derive(Clone)]
pub struct SecurityService<S> {
    inner: S,
}

impl<S> Service<Request> for SecurityService<S>
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
        let mut inner = self.inner.clone();

        Box::pin(async move {
            let mut response = inner.call(req).await?;

            let headers = response.headers_mut();

            // Prevent XSS attacks
            headers.insert(
                HeaderName::from_static("x-content-type-options"),
                HeaderValue::from_static("nosniff"),
            );

            // Content Security Policy to prevent XSS
            headers.insert(
                HeaderName::from_static("content-security-policy"),
                HeaderValue::from_static(
                    "default-src 'self'; \
                     script-src 'self' 'unsafe-inline' 'unsafe-eval'; \
                     style-src 'self' 'unsafe-inline'; \
                     img-src 'self' data: https:; \
                     font-src 'self' data:; \
                     connect-src 'self'; \
                     frame-ancestors 'none'; \
                     base-uri 'self';",
                ),
            );

            // Prevent clickjacking
            headers.insert(
                HeaderName::from_static("x-frame-options"),
                HeaderValue::from_static("DENY"),
            );

            // Force HTTPS in production
            headers.insert(
                HeaderName::from_static("strict-transport-security"),
                HeaderValue::from_static("max-age=31536000; includeSubDomains; preload"),
            );

            // Prevent MIME type sniffing
            headers.insert(
                HeaderName::from_static("x-content-type-options"),
                HeaderValue::from_static("nosniff"),
            );

            // Referrer policy
            headers.insert(
                HeaderName::from_static("referrer-policy"),
                HeaderValue::from_static("strict-origin-when-cross-origin"),
            );

            // Permissions policy
            headers.insert(
                HeaderName::from_static("permissions-policy"),
                HeaderValue::from_static(
                    "camera=(), microphone=(), geolocation=(), \
                     payment=(), usb=(), magnetometer=(), gyroscope=()",
                ),
            );

            Ok(response)
        })
    }
}
