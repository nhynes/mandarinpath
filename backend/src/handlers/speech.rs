use axum::{
    extract::{
        Extension,
        Multipart,
    },
    response::Result as AxumResult,
    Json,
};
use bytes::Bytes;
use serde::{
    Deserialize,
    Serialize,
};
use tracing::{
    error,
    info,
    warn,
};

use crate::{
    error::AppError,
    speech::{
        IFlytekService,
        SpeechEvaluationRequest,
        SpeechEvaluationResponse,
    },
};

#[derive(Debug, Deserialize)]
pub struct EvaluateSpeechParams {
    pub ref_text: String,
    pub lang: Option<String>,
    pub core: Option<String>,
    pub ref_pinyin: Option<String>,
    pub phoneme_output: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct ApiSpeechEvaluationResponse {
    pub success: bool,
    pub data: Option<SpeechEvaluationResponse>,
    pub error: Option<String>,
}

pub async fn evaluate_speech(
    Extension(iflytek_service): Extension<IFlytekService>,
    mut multipart: Multipart,
) -> AxumResult<Json<ApiSpeechEvaluationResponse>, AppError> {
    info!("Received speech evaluation request");

    let mut params: Option<EvaluateSpeechParams> = None;
    let mut audio_data: Option<Bytes> = None;
    let mut audio_encoding = "lame".to_string();
    let mut sample_rate = 16000u32;
    let mut channels = 1u8;
    let mut bit_depth = 16u8;

    // Parse multipart form data
    while let Some(field) = multipart.next_field().await.map_err(|e| {
        error!("Failed to parse multipart field: {}", e);
        AppError::BadRequest("Invalid multipart data".to_string())
    })? {
        let field_name = field.name().unwrap_or("").to_string();

        match field_name.as_str() {
            "params" => {
                let params_bytes = field.bytes().await.map_err(|e| {
                    error!("Failed to read params field: {}", e);
                    AppError::BadRequest("Failed to read params".to_string())
                })?;

                params = Some(serde_json::from_slice(&params_bytes).map_err(|e| {
                    error!("Failed to parse params JSON: {}", e);
                    AppError::BadRequest("Invalid params JSON".to_string())
                })?);
            }
            "audio" => {
                audio_data = Some(field.bytes().await.map_err(|e| {
                    error!("Failed to read audio field: {}", e);
                    AppError::BadRequest("Failed to read audio data".to_string())
                })?);
            }
            "encoding" => {
                let encoding_bytes = field
                    .bytes()
                    .await
                    .map_err(|_| AppError::BadRequest("Failed to read encoding".to_string()))?;
                audio_encoding = String::from_utf8(encoding_bytes.to_vec())
                    .unwrap_or_else(|_| "lame".to_string());
            }
            "sample_rate" => {
                let sample_rate_bytes = field
                    .bytes()
                    .await
                    .map_err(|_| AppError::BadRequest("Failed to read sample_rate".to_string()))?;
                let sample_rate_str = String::from_utf8(sample_rate_bytes.to_vec())
                    .unwrap_or_else(|_| "16000".to_string());
                sample_rate = sample_rate_str.parse().unwrap_or(16000);
            }
            "channels" => {
                let channels_bytes = field
                    .bytes()
                    .await
                    .map_err(|_| AppError::BadRequest("Failed to read channels".to_string()))?;
                let channels_str =
                    String::from_utf8(channels_bytes.to_vec()).unwrap_or_else(|_| "1".to_string());
                channels = channels_str.parse().unwrap_or(1);
            }
            "bit_depth" => {
                let bit_depth_bytes = field
                    .bytes()
                    .await
                    .map_err(|_| AppError::BadRequest("Failed to read bit_depth".to_string()))?;
                let bit_depth_str = String::from_utf8(bit_depth_bytes.to_vec())
                    .unwrap_or_else(|_| "16".to_string());
                bit_depth = bit_depth_str.parse().unwrap_or(16);
            }
            _ => {
                warn!("Unknown field in multipart data: {}", field_name);
            }
        }
    }

    let params = params.ok_or_else(|| {
        error!("Missing params in request");
        AppError::BadRequest("Missing required params".to_string())
    })?;

    let audio_data = audio_data.ok_or_else(|| {
        error!("Missing audio data in request");
        AppError::BadRequest("Missing audio data".to_string())
    })?;

    if audio_data.is_empty() {
        error!("Empty audio data received");
        return Ok(Json(ApiSpeechEvaluationResponse {
            success: false,
            data: None,
            error: Some("Empty audio data".to_string()),
        }));
    }

    info!(
        "Processing speech evaluation for text: '{}', audio size: {} bytes",
        params.ref_text,
        audio_data.len()
    );

    // Create iFlytek request
    let request = SpeechEvaluationRequest {
        audio_data,
        ref_text: params.ref_text,
        lang: params.lang.unwrap_or_else(|| "cn".to_string()),
        core: params.core.unwrap_or_else(|| "sent".to_string()),
        ref_pinyin: params.ref_pinyin,
        phoneme_output: params.phoneme_output.unwrap_or(true),
        audio_encoding,
        sample_rate,
        channels,
        bit_depth,
    };

    // Call iFlytek service
    match iflytek_service.evaluate_speech(request).await {
        Ok(response) => {
            if let Some(error) = &response.error {
                warn!("iFlytek API returned error: {}", error);
                Ok(Json(ApiSpeechEvaluationResponse {
                    success: false,
                    data: None,
                    error: Some(error.clone()),
                }))
            } else {
                info!("Speech evaluation completed successfully");
                Ok(Json(ApiSpeechEvaluationResponse {
                    success: true,
                    data: Some(response),
                    error: None,
                }))
            }
        }
        Err(e) => {
            error!("Failed to evaluate speech: {}", e);
            Ok(Json(ApiSpeechEvaluationResponse {
                success: false,
                data: None,
                error: Some(format!("Speech evaluation failed: {}", e)),
            }))
        }
    }
}

pub async fn health_check() -> AxumResult<Json<serde_json::Value>, AppError> {
    Ok(Json(serde_json::json!({
        "status": "ok",
        "service": "speech_evaluation"
    })))
}
