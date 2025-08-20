#[cfg(test)]
mod tests {
    use bytes::Bytes;
    use mandarinpath_backend::speech::{
        iflytek::IFlytekConfig,
        IFlytekService,
        SpeechEvaluationRequest,
    };

    #[tokio::test]
    async fn test_iflytek_config_creation() {
        let config = IFlytekConfig {
            app_id: "test_app_id".to_string(),
            api_key: "test_api_key".to_string(),
            api_secret: "test_api_secret".to_string(),
            ws_url: "wss://example.com/test".to_string(),
        };

        let service = IFlytekService::new(config.clone());

        // Test that service is created correctly
        assert!(!service.config().app_id.is_empty());
        assert!(!service.config().api_key.is_empty());
        assert!(!service.config().api_secret.is_empty());
        assert!(!service.config().ws_url.is_empty());
    }

    #[test]
    fn test_iflytek_config_default() {
        let config = IFlytekConfig::default();

        // Default config should use environment variables or defaults
        assert!(!config.ws_url.is_empty());
        assert_eq!(
            config.ws_url,
            "wss://cn-east-1.ws-api.xf-yun.com/v1/private/s8e098720"
        );
    }

    #[test]
    fn test_speech_evaluation_request_creation() {
        let audio_data = Bytes::from("test audio data");
        let request = SpeechEvaluationRequest {
            audio_data: audio_data.clone(),
            ref_text: "你好".to_string(),
            lang: "cn".to_string(),
            core: "sent".to_string(),
            ref_pinyin: Some("nǐ hǎo".to_string()),
            phoneme_output: true,
            audio_encoding: "lame".to_string(),
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
        };

        assert_eq!(request.audio_data, audio_data);
        assert_eq!(request.ref_text, "你好");
        assert_eq!(request.lang, "cn");
        assert_eq!(request.core, "sent");
        assert_eq!(request.ref_pinyin, Some("nǐ hǎo".to_string()));
        assert!(request.phoneme_output);
        assert_eq!(request.audio_encoding, "lame");
        assert_eq!(request.sample_rate, 16000);
        assert_eq!(request.channels, 1);
        assert_eq!(request.bit_depth, 16);
    }

    #[test]
    fn test_iflytek_service_clone() {
        let config = IFlytekConfig {
            app_id: "test_app_id".to_string(),
            api_key: "test_api_key".to_string(),
            api_secret: "test_api_secret".to_string(),
            ws_url: "wss://example.com/test".to_string(),
        };

        let service1 = IFlytekService::new(config);
        let service2 = service1.clone();

        // Both services should have the same configuration
        assert_eq!(service1.config().app_id, service2.config().app_id);
        assert_eq!(service1.config().api_key, service2.config().api_key);
        assert_eq!(service1.config().api_secret, service2.config().api_secret);
        assert_eq!(service1.config().ws_url, service2.config().ws_url);
    }

    #[test]
    fn test_request_parameters() {
        let request = create_test_request();

        // Test Chinese language setup
        assert_eq!(request.lang, "cn");
        assert_eq!(request.core, "sent");
        assert!(request.phoneme_output);

        // Test audio parameters
        assert_eq!(request.audio_encoding, "lame");
        assert_eq!(request.sample_rate, 16000);
        assert_eq!(request.channels, 1);
        assert_eq!(request.bit_depth, 16);

        // Test text parameters
        assert_eq!(request.ref_text, "你好");
        assert_eq!(request.ref_pinyin, Some("nǐ hǎo".to_string()));
    }

    #[test]
    fn test_english_request_parameters() {
        let mut request = create_test_request();
        request.lang = "en".to_string();
        request.ref_text = "Hello".to_string();
        request.ref_pinyin = None;

        assert_eq!(request.lang, "en");
        assert_eq!(request.ref_text, "Hello");
        assert_eq!(request.ref_pinyin, None);
    }

    #[tokio::test]
    async fn test_speech_evaluation_request_validation() {
        let service = create_test_service();
        let chinese_request = create_chinese_evaluation_request();
        let english_request = create_english_evaluation_request();

        // Test that requests have valid structure
        assert!(!chinese_request.audio_data.is_empty());
        assert!(!chinese_request.ref_text.is_empty());
        assert_eq!(chinese_request.lang, "cn");

        assert!(!english_request.audio_data.is_empty());
        assert!(!english_request.ref_text.is_empty());
        assert_eq!(english_request.lang, "en");

        // Test that service can handle different language requests
        assert_eq!(service.config().app_id, "test_app_id");
    }

    #[test]
    fn test_audio_encoding_support() {
        let encodings = ["lame", "speex", "speex-wb"];

        for encoding in encodings.iter() {
            let request = SpeechEvaluationRequest {
                audio_data: Bytes::from("test data"),
                ref_text: "test".to_string(),
                lang: "cn".to_string(),
                core: "sent".to_string(),
                ref_pinyin: None,
                phoneme_output: false,
                audio_encoding: encoding.to_string(),
                sample_rate: 16000,
                channels: 1,
                bit_depth: 16,
            };

            assert_eq!(request.audio_encoding, *encoding);
        }
    }

    #[test]
    fn test_core_modes() {
        let modes = ["word", "sent", "para"];

        for mode in modes.iter() {
            let request = SpeechEvaluationRequest {
                audio_data: Bytes::from("test data"),
                ref_text: "test".to_string(),
                lang: "cn".to_string(),
                core: mode.to_string(),
                ref_pinyin: None,
                phoneme_output: false,
                audio_encoding: "lame".to_string(),
                sample_rate: 16000,
                channels: 1,
                bit_depth: 16,
            };

            assert_eq!(request.core, *mode);
        }
    }

    // Helper functions
    fn create_test_request() -> SpeechEvaluationRequest {
        SpeechEvaluationRequest {
            audio_data: Bytes::from("test audio data"),
            ref_text: "你好".to_string(),
            lang: "cn".to_string(),
            core: "sent".to_string(),
            ref_pinyin: Some("nǐ hǎo".to_string()),
            phoneme_output: true,
            audio_encoding: "lame".to_string(),
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
        }
    }

    fn create_test_service() -> IFlytekService {
        let config = IFlytekConfig {
            app_id: "test_app_id".to_string(),
            api_key: "test_api_key".to_string(),
            api_secret: "test_api_secret".to_string(),
            ws_url: "wss://cn-east-1.ws-api.xf-yun.com/v1/private/s8e098720".to_string(),
        };
        IFlytekService::new(config)
    }

    fn create_test_audio_data() -> Bytes {
        // Create some mock audio data
        // In a real test, this might be actual WAV/MP3 data
        Bytes::from(vec![0; 1024]) // 1KB of zeros as mock audio
    }

    fn create_chinese_evaluation_request() -> SpeechEvaluationRequest {
        SpeechEvaluationRequest {
            audio_data: create_test_audio_data(),
            ref_text: "你好世界".to_string(),
            lang: "cn".to_string(),
            core: "sent".to_string(),
            ref_pinyin: Some("nǐ hǎo shì jiè".to_string()),
            phoneme_output: true,
            audio_encoding: "lame".to_string(),
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
        }
    }

    fn create_english_evaluation_request() -> SpeechEvaluationRequest {
        SpeechEvaluationRequest {
            audio_data: create_test_audio_data(),
            ref_text: "Hello world".to_string(),
            lang: "en".to_string(),
            core: "sent".to_string(),
            ref_pinyin: None,
            phoneme_output: true,
            audio_encoding: "lame".to_string(),
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
        }
    }
}
