pub mod iflytek;

pub use iflytek::{
    IFlytekService,
    SpeechEvaluationRequest,
    SpeechEvaluationResponse,
};

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use bytes::Bytes;

    use super::*;
    use crate::speech::iflytek::{
        IFlytekConfig,
        WordScore,
        WordScores,
    };

    #[test]
    fn test_speech_evaluation_request_creation() {
        let audio_data = Bytes::from(vec![1, 2, 3, 4, 5]);
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
    fn test_iflytek_config_default() {
        // Mock environment variables for test
        std::env::set_var("IFLYTEK_APP_ID", "test_app_id");
        std::env::set_var("IFLYTEK_API_KEY", "test_api_key");
        std::env::set_var("IFLYTEK_API_SECRET", "test_api_secret");

        let config = IFlytekConfig::default();

        assert_eq!(config.app_id, "test_app_id");
        assert_eq!(config.api_key, "test_api_key");
        assert_eq!(config.api_secret, "test_api_secret");
        assert_eq!(
            config.ws_url,
            "wss://cn-east-1.ws-api.xf-yun.com/v1/private/s8e098720"
        );

        // Clean up environment variables
        std::env::remove_var("IFLYTEK_APP_ID");
        std::env::remove_var("IFLYTEK_API_KEY");
        std::env::remove_var("IFLYTEK_API_SECRET");
    }

    #[test]
    fn test_iflytek_service_creation() {
        let config = IFlytekConfig {
            app_id: "test_app".to_string(),
            api_key: "test_key".to_string(),
            api_secret: "test_secret".to_string(),
            ws_url: "wss://test.example.com".to_string(),
        };

        let service = IFlytekService::new(config.clone());
        assert_eq!(service.config().app_id, config.app_id);
        assert_eq!(service.config().api_key, config.api_key);
    }

    #[test]
    fn test_speech_evaluation_response_structure() {
        let mut overall_scores = HashMap::new();
        overall_scores.insert("pronunciation".to_string(), 85.5);
        overall_scores.insert("fluency".to_string(), 78.0);

        let word_score = WordScore {
            word: "你好".to_string(),
            pinyin: Some("nǐ hǎo".to_string()),
            tone: Some("tone3_tone3".to_string()),
            scores: WordScores {
                overall: 90.0,
                pronunciation: 88.0,
                tone: Some(92.0),
                prominence: Some(85.0),
            },
            read_type: 0,
            span: None,
            phonemes: None,
        };

        let response = SpeechEvaluationResponse {
            overall_scores,
            words: vec![word_score.clone()],
            error: None,
        };

        assert_eq!(response.overall_scores.len(), 2);
        assert_eq!(response.overall_scores.get("pronunciation"), Some(&85.5));
        assert_eq!(response.words.len(), 1);
        assert_eq!(response.words[0].word, "你好");
        assert_eq!(response.words[0].scores.pronunciation, 88.0);
        assert!(response.error.is_none());
    }

    #[test]
    fn test_word_score_read_types() {
        // Test normal word (read_type = 0)
        let normal_word = WordScore {
            word: "你好".to_string(),
            pinyin: None,
            tone: None,
            scores: WordScores {
                overall: 85.0,
                pronunciation: 85.0,
                tone: None,
                prominence: None,
            },
            read_type: 0, // Normal
            span: None,
            phonemes: None,
        };
        assert_eq!(normal_word.read_type, 0);

        // Test insertion (read_type = 1)
        let insertion_word = WordScore {
            word: "额外".to_string(),
            pinyin: None,
            tone: None,
            scores: WordScores {
                overall: 0.0,
                pronunciation: 0.0,
                tone: None,
                prominence: None,
            },
            read_type: 1, // Insertion/extra word
            span: None,
            phonemes: None,
        };
        assert_eq!(insertion_word.read_type, 1);

        // Test omission (read_type = 2)
        let omission_word = WordScore {
            word: "遗漏".to_string(),
            pinyin: None,
            tone: None,
            scores: WordScores {
                overall: 0.0,
                pronunciation: 0.0,
                tone: None,
                prominence: None,
            },
            read_type: 2, // Omission/missing word
            span: None,
            phonemes: None,
        };
        assert_eq!(omission_word.read_type, 2);
    }

    #[test]
    fn test_service_clone() {
        let config = IFlytekConfig {
            app_id: "test_app".to_string(),
            api_key: "test_key".to_string(),
            api_secret: "test_secret".to_string(),
            ws_url: "wss://test.example.com".to_string(),
        };

        let service1 = IFlytekService::new(config);
        let service2 = service1.clone();

        assert_eq!(service1.config().app_id, service2.config().app_id);
        assert_eq!(service1.config().api_key, service2.config().api_key);
    }
}
