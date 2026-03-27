package com.education.udemy.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/ai")
@Slf4j
public class AIChatController {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private static final String GEMINI_MODEL = "gemini-2.5-flash-lite";
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent";

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> frontendBody) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> contents = (List<Map<String, Object>>) frontendBody.get("contents");

            Map<String, Object> generationConfig = (Map<String, Object>) frontendBody.get("generationConfig");

            Map<String, Object> geminiRequest = new HashMap<>();
            geminiRequest.put("contents", contents);
            if (generationConfig != null) {
                geminiRequest.put("generationConfig", generationConfig);
            }

            String url = GEMINI_URL + "?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(geminiRequest, headers);

            ResponseEntity<Map> geminiResponse = restTemplate.postForEntity(url, request, Map.class);

            if (!geminiResponse.getStatusCode().is2xxSuccessful() || geminiResponse.getBody() == null) {
                throw new RuntimeException("Gemini API error");
            }

            String replyText = extractText(geminiResponse.getBody());

            return ResponseEntity.ok(Map.of("text", replyText));

        } catch (Exception e) {
            log.error("Gemini API error: ", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Trợ lý AI tạm thời không khả dụng. Vui lòng thử lại sau hoặc liên hệ support@eduplatform.vn"));
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> body) {
        try {
            var candidates = (List<?>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "Không có phản hồi từ AI.";
            }

            var candidate = (Map<?, ?>) candidates.get(0);
            var content = (Map<?, ?>) candidate.get("content");
            var parts = (List<?>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                return "Không có phản hồi từ AI.";
            }

            var part = (Map<?, ?>) parts.get(0);
            String text = (String) part.get("text");
            return text != null ? text : "Xin lỗi, tôi không thể xử lý lúc này.";
        } catch (Exception e) {
            log.warn("Không parse được response từ Gemini: {}", e.getMessage());
            return "Xin lỗi, tôi không thể xử lý phản hồi lúc này.";
        }
    }
}