use std::collections::HashMap;

use anyhow::{
    Context,
    Result,
};
use base64::{
    engine::general_purpose::STANDARD,
    Engine as _,
};
use bytes::Bytes;
use chrono::{
    DateTime,
    Utc,
};
use futures_util::{
    SinkExt,
    StreamExt,
};
use hmac::{
    Hmac,
    Mac,
};
use serde::{
    Deserialize,
    Serialize,
};
use serde_json::json;
use sha2::Sha256;
use tokio_tungstenite::{
    connect_async,
    tungstenite::Message,
};
use tracing::{
    debug,
    info,
    warn,
};
use url::Url;

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Clone)]
pub struct IFlytekConfig {
    pub app_id: String,
    pub api_key: String,
    pub api_secret: String,
    pub ws_url: String, // Chinese/English endpoint
}

#[derive(Debug)]
pub struct SpeechEvaluationRequest {
    pub audio_data: Bytes,
    pub ref_text: String,
    pub lang: String, // "cn", "en", etc.
    pub core: String, // "word", "sent", "para"
    pub ref_pinyin: Option<String>,
    pub phoneme_output: bool,
    pub audio_encoding: String, // "lame", "speex", "speex-wb"
    pub sample_rate: u32,
    pub channels: u8,
    pub bit_depth: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordScore {
    pub word: String,
    pub pinyin: Option<String>,
    pub tone: Option<String>,
    pub scores: WordScores,
    pub read_type: u8, // 0=normal, 1=insertion, 2=omission
    pub span: Option<TimeSpan>,
    pub phonemes: Option<Vec<PhonemeScore>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordScores {
    pub overall: f32,
    pub pronunciation: f32,
    pub tone: Option<f32>,
    pub prominence: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhonemeScore {
    pub phoneme: String,
    pub pronunciation: f32,
    pub span: Option<TimeSpan>,
    pub tone_index: Option<u8>,
    pub phone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeSpan {
    pub start: u32, // 10ms units
    pub end: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SpeechEvaluationResponse {
    pub overall_scores: HashMap<String, f32>,
    pub words: Vec<WordScore>,
    pub error: Option<String>,
}

#[derive(Clone)]
pub struct IFlytekService {
    config: IFlytekConfig,
}

impl IFlytekService {
    pub fn new(config: IFlytekConfig) -> Self {
        Self { config }
    }

    pub fn config(&self) -> &IFlytekConfig {
        &self.config
    }

    pub async fn evaluate_speech(
        &self,
        request: SpeechEvaluationRequest,
    ) -> Result<SpeechEvaluationResponse> {
        info!("Starting speech evaluation for text: {}", request.ref_text);

        // Generate authentication parameters
        let auth_url = self.generate_auth_url()?;
        debug!("Connecting to iFlytek WebSocket: {}", auth_url);

        // Connect to WebSocket
        let (ws_stream, _) = connect_async(&auth_url)
            .await
            .context("Failed to connect to iFlytek WebSocket")?;

        let (mut ws_sender, mut ws_receiver) = ws_stream.split();

        // Send start frame
        let start_frame = self.create_start_frame(&request)?;
        ws_sender
            .send(Message::Text(start_frame))
            .await
            .context("Failed to send start frame")?;

        // Send audio data frame
        let audio_frame = self.create_audio_frame(&request)?;
        ws_sender
            .send(Message::Text(audio_frame))
            .await
            .context("Failed to send audio frame")?;

        // Send end frame
        let end_frame = self.create_end_frame(&request)?;
        ws_sender
            .send(Message::Text(end_frame))
            .await
            .context("Failed to send end frame")?;

        // Receive and process response
        let mut response_data = Vec::new();

        while let Some(msg_result) = ws_receiver.next().await {
            match msg_result {
                Ok(Message::Text(text)) => {
                    debug!("Received response: {}", text);

                    // Check if this is the final message
                    let is_final =
                        if let Ok(json_value) = serde_json::from_str::<serde_json::Value>(&text) {
                            if let Some(header) = json_value.get("header") {
                                if let Some(status) = header.get("status") {
                                    status == 2 // Final frame
                                } else {
                                    false
                                }
                            } else {
                                false
                            }
                        } else {
                            false
                        };

                    response_data.push(text);

                    if is_final {
                        break;
                    }
                }
                Ok(Message::Close(_)) => {
                    debug!("WebSocket closed by server");
                    break;
                }
                Err(e) => {
                    warn!("WebSocket error: {}", e);
                    break;
                }
                _ => {}
            }
        }

        // Parse the accumulated response data
        self.parse_response(response_data).await
    }

    fn generate_auth_url(&self) -> Result<String> {
        let base_url = &self.config.ws_url;
        let mut url = Url::parse(base_url).context("Failed to parse WebSocket URL")?;

        // Generate current timestamp in RFC1123 format
        let now: DateTime<Utc> = Utc::now();
        let date = now.format("%a, %d %b %Y %H:%M:%S GMT").to_string();

        // Create signature string
        let host = url.host_str().unwrap_or_default().to_string();
        let path_and_query = url.path();
        let request_line = format!("GET {} HTTP/1.1", path_and_query);

        let signature_string = format!("host: {}\ndate: {}\n{}", host, date, request_line);

        // Generate HMAC signature
        let mut mac = HmacSha256::new_from_slice(self.config.api_secret.as_bytes())
            .context("Failed to create HMAC")?;
        mac.update(signature_string.as_bytes());
        let signature = STANDARD.encode(mac.finalize().into_bytes());

        // Create authorization header
        let authorization = format!(
            "api_key=\"{}\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"{}\"",
            self.config.api_key, signature
        );
        let authorization_b64 = STANDARD.encode(authorization.as_bytes());

        // Add query parameters
        url.query_pairs_mut()
            .append_pair("host", &host)
            .append_pair("date", &date)
            .append_pair("authorization", &authorization_b64);

        Ok(url.to_string())
    }

    fn create_start_frame(&self, request: &SpeechEvaluationRequest) -> Result<String> {
        let mut parameter = json!({
            "st": {
                "lang": request.lang,
                "core": request.core,
                "refText": request.ref_text,
                "phoneme_output": if request.phoneme_output { 1 } else { 0 },
                "result": {
                    "encoding": "utf8",
                    "compress": "raw",
                    "format": "plain"
                }
            }
        });

        // Add optional refPinyin if provided
        if let Some(ref_pinyin) = &request.ref_pinyin {
            parameter["st"]["refPinyin"] = json!(ref_pinyin);
        }

        // For English, add dict_type
        if request.lang == "en" {
            parameter["st"]["dict_type"] = json!("IPA88");
        }

        let frame = json!({
            "header": {
                "app_id": self.config.app_id,
                "status": 0
            },
            "parameter": parameter,
            "payload": {
                "data": {
                    "encoding": request.audio_encoding,
                    "sample_rate": request.sample_rate,
                    "channels": request.channels,
                    "bit_depth": request.bit_depth,
                    "status": 0,
                    "seq": 0,
                    "audio": ""
                }
            }
        });

        Ok(serde_json::to_string(&frame)?)
    }

    fn create_audio_frame(&self, request: &SpeechEvaluationRequest) -> Result<String> {
        let audio_b64 = STANDARD.encode(&request.audio_data);

        let frame = json!({
            "header": {
                "app_id": self.config.app_id,
                "status": 1
            },
            "payload": {
                "data": {
                    "encoding": request.audio_encoding,
                    "sample_rate": request.sample_rate,
                    "channels": request.channels,
                    "bit_depth": request.bit_depth,
                    "status": 1,
                    "seq": 1,
                    "audio": audio_b64
                }
            }
        });

        Ok(serde_json::to_string(&frame)?)
    }

    fn create_end_frame(&self, request: &SpeechEvaluationRequest) -> Result<String> {
        let frame = json!({
            "header": {
                "app_id": self.config.app_id,
                "status": 2
            },
            "payload": {
                "data": {
                    "encoding": request.audio_encoding,
                    "sample_rate": request.sample_rate,
                    "channels": request.channels,
                    "bit_depth": request.bit_depth,
                    "status": 2,
                    "seq": 2,
                    "audio": ""
                }
            }
        });

        Ok(serde_json::to_string(&frame)?)
    }

    async fn parse_response(&self, response_data: Vec<String>) -> Result<SpeechEvaluationResponse> {
        let mut overall_scores = HashMap::new();
        let mut words = Vec::new();
        let mut error_msg = None;

        for response_text in response_data {
            let json_value: serde_json::Value =
                serde_json::from_str(&response_text).context("Failed to parse response JSON")?;

            // Check for errors
            if let Some(header) = json_value.get("header") {
                if let Some(code) = header.get("code") {
                    if code.as_i64() != Some(0) {
                        if let Some(message) = header.get("message") {
                            error_msg =
                                Some(message.as_str().unwrap_or("Unknown error").to_string());
                            continue;
                        }
                    }
                }
            }

            // Parse payload data
            if let Some(payload) = json_value.get("payload") {
                if let Some(result_data) = payload.get("result") {
                    if let Some(data) = result_data.get("data") {
                        if let Some(data_str) = data.as_str() {
                            // Decode base64 data
                            if let Ok(decoded_bytes) = STANDARD.decode(data_str) {
                                if let Ok(decoded_str) = String::from_utf8(decoded_bytes) {
                                    debug!("Decoded result data: {}", decoded_str);

                                    // Parse the result JSON
                                    if let Ok(result_json) =
                                        serde_json::from_str::<serde_json::Value>(&decoded_str)
                                    {
                                        // Extract overall scores
                                        if let Some(scores) = result_json.get("overall") {
                                            overall_scores.insert(
                                                "overall".to_string(),
                                                scores.as_f64().unwrap_or(0.0) as f32,
                                            );
                                        }
                                        if let Some(scores) = result_json.get("pronunciation") {
                                            overall_scores.insert(
                                                "pronunciation".to_string(),
                                                scores.as_f64().unwrap_or(0.0) as f32,
                                            );
                                        }
                                        if let Some(scores) = result_json.get("fluency") {
                                            overall_scores.insert(
                                                "fluency".to_string(),
                                                scores.as_f64().unwrap_or(0.0) as f32,
                                            );
                                        }
                                        if let Some(scores) = result_json.get("tone") {
                                            overall_scores.insert(
                                                "tone".to_string(),
                                                scores.as_f64().unwrap_or(0.0) as f32,
                                            );
                                        }

                                        // Extract word-level scores
                                        if let Some(words_array) = result_json.get("words") {
                                            if let Some(words_vec) = words_array.as_array() {
                                                for word_data in words_vec {
                                                    if let Ok(word_score) =
                                                        self.parse_word_score(word_data)
                                                    {
                                                        words.push(word_score);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(SpeechEvaluationResponse {
            overall_scores,
            words,
            error: error_msg,
        })
    }

    fn parse_word_score(&self, word_data: &serde_json::Value) -> Result<WordScore> {
        let word = word_data
            .get("word")
            .and_then(|w| w.as_str())
            .unwrap_or("")
            .to_string();

        let pinyin = word_data
            .get("pinyin")
            .and_then(|p| p.as_str())
            .map(|s| s.to_string());

        let tone = word_data
            .get("tone")
            .and_then(|t| t.as_str())
            .map(|s| s.to_string());

        let read_type = word_data
            .get("readType")
            .and_then(|rt| rt.as_u64())
            .unwrap_or(0) as u8;

        // Parse scores
        let scores = if let Some(scores_obj) = word_data.get("scores") {
            WordScores {
                overall: scores_obj
                    .get("overall")
                    .and_then(|s| s.as_f64())
                    .unwrap_or(0.0) as f32,
                pronunciation: scores_obj
                    .get("pronunciation")
                    .and_then(|s| s.as_f64())
                    .unwrap_or(0.0) as f32,
                tone: scores_obj
                    .get("tone")
                    .and_then(|s| s.as_f64())
                    .map(|f| f as f32),
                prominence: scores_obj
                    .get("prominence")
                    .and_then(|s| s.as_f64())
                    .map(|f| f as f32),
            }
        } else {
            WordScores {
                overall: 0.0,
                pronunciation: 0.0,
                tone: None,
                prominence: None,
            }
        };

        // Parse time span
        let span = if let Some(span_obj) = word_data.get("span") {
            Some(TimeSpan {
                start: span_obj.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32,
                end: span_obj.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as u32,
            })
        } else {
            None
        };

        // Parse phonemes
        let phonemes = if let Some(phonemes_array) = word_data.get("phonemes") {
            if let Some(phonemes_vec) = phonemes_array.as_array() {
                let mut parsed_phonemes = Vec::new();
                for phoneme_data in phonemes_vec {
                    if let Ok(phoneme) = self.parse_phoneme_score(phoneme_data) {
                        parsed_phonemes.push(phoneme);
                    }
                }
                if !parsed_phonemes.is_empty() {
                    Some(parsed_phonemes)
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        };

        Ok(WordScore {
            word,
            pinyin,
            tone,
            scores,
            read_type,
            span,
            phonemes,
        })
    }

    fn parse_phoneme_score(&self, phoneme_data: &serde_json::Value) -> Result<PhonemeScore> {
        let phoneme = phoneme_data
            .get("phoneme")
            .and_then(|p| p.as_str())
            .unwrap_or("")
            .to_string();

        let pronunciation = phoneme_data
            .get("pronunciation")
            .and_then(|p| p.as_f64())
            .unwrap_or(0.0) as f32;

        let span = if let Some(span_obj) = phoneme_data.get("span") {
            Some(TimeSpan {
                start: span_obj.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32,
                end: span_obj.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as u32,
            })
        } else {
            None
        };

        let tone_index = phoneme_data
            .get("tone_index")
            .and_then(|ti| ti.as_u64())
            .map(|i| i as u8);

        let phone = phoneme_data
            .get("phone")
            .and_then(|p| p.as_str())
            .map(|s| s.to_string());

        Ok(PhonemeScore {
            phoneme,
            pronunciation,
            span,
            tone_index,
            phone,
        })
    }
}

impl Default for IFlytekConfig {
    fn default() -> Self {
        Self {
            app_id: std::env::var("IFLYTEK_APP_ID").unwrap_or_default(),
            api_key: std::env::var("IFLYTEK_API_KEY").unwrap_or_default(),
            api_secret: std::env::var("IFLYTEK_API_SECRET").unwrap_or_default(),
            ws_url: "wss://cn-east-1.ws-api.xf-yun.com/v1/private/s8e098720".to_string(), // Chinese/English
        }
    }
}
