use anyhow::Result;
use clap::Parser;
use secrecy::{
    ExposeSecret,
    Secret,
};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// Database URL
    #[arg(
        short,
        long,
        env = "DATABASE_URL",
        default_value = "sqlite:./mandarinpath.db"
    )]
    pub database_url: String,

    /// JWT secret key
    #[arg(
        long,
        env = "JWT_SECRET",
        default_value = "your-secret-key-change-me-in-production"
    )]
    pub jwt_secret: String,

    /// Frontend URL for CORS
    #[arg(
        short,
        long,
        env = "FRONTEND_URL",
        default_value = "http://localhost:5173"
    )]
    pub frontend_url: String,

    /// Port to listen on
    #[arg(short, long, env = "PORT", default_value = "3000")]
    pub port: u16,

    /// Enable debug mode
    #[arg(long, env = "DEBUG")]
    pub debug: bool,

    /// Increase logging verbosity (-v, -vv, -vvv)
    #[arg(short, long, action = clap::ArgAction::Count)]
    pub verbose: u8,
}

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: Secret<String>,
    pub frontend_url: String,
    pub port: u16,
    pub debug_mode: bool,
    pub verbosity: u8,
}

impl Config {
    pub fn from_args() -> Result<Self> {
        let args = Args::parse();

        if args.jwt_secret == "your-secret-key-change-me-in-production" {
            tracing::warn!("JWT_SECRET not set, using default (insecure for production)");
        }

        Ok(Self {
            database_url: args.database_url,
            jwt_secret: Secret::new(args.jwt_secret),
            frontend_url: args.frontend_url,
            port: args.port,
            debug_mode: args.debug,
            verbosity: args.verbose,
        })
    }

    pub fn jwt_secret(&self) -> &str {
        self.jwt_secret.expose_secret()
    }
}
