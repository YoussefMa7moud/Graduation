package com.grad.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GroqApiClient {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    public static final String DEFAULT_MODEL = "llama-3.3-70b-versatile";

    @Value("${app.groq.api.key:}")
    private String groqApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GroqApiClient() {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15_000);
        factory.setReadTimeout(120_000);
        this.restTemplate = new RestTemplate(factory);
    }

    @PostConstruct
    public void init() {
        if (groqApiKey == null || groqApiKey.isBlank() || groqApiKey.equals("${GROQ_API_KEY}")) {
            loadKeyFromEnvFiles();
        }
        if (groqApiKey != null && groqApiKey.length() > 6) {
            log.info("Groq API key ready for AI services");
        } else {
            log.warn("Groq API key not configured; AI features will be unavailable");
        }
    }

    public boolean isConfigured() {
        return groqApiKey != null && !groqApiKey.isBlank();
    }

    public String chatCompletion(List<Map<String, Object>> messages, double temperature, int maxTokens, boolean jsonMode) {
        if (!isConfigured()) {
            throw new IllegalStateException("AI service is not configured (missing GROQ_API_KEY)");
        }

        try {
            Map<String, Object> body = new java.util.HashMap<>();
            body.put("model", DEFAULT_MODEL);
            body.put("messages", messages);
            body.put("temperature", temperature);
            body.put("max_tokens", maxTokens);
            if (jsonMode) {
                body.put("response_format", Map.of("type", "json_object"));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    GROQ_URL, new HttpEntity<>(body, headers), String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Groq API error: " + response.getStatusCode());
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").path(0).path("message").path("content").asText();
            if (content == null || content.isBlank()) {
                throw new RuntimeException("Groq returned empty content");
            }
            return content;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Groq chat completion failed: {}", e.getMessage());
            throw new RuntimeException("AI request failed: " + e.getMessage(), e);
        }
    }

    private void loadKeyFromEnvFiles() {
        java.util.List<java.nio.file.Path> candidates = new java.util.ArrayList<>();
        candidates.add(java.nio.file.Paths.get(".env"));
        candidates.add(java.nio.file.Paths.get("Backend/backend/.env"));
        candidates.add(java.nio.file.Paths.get("backend/.env"));

        for (java.nio.file.Path envPath : candidates) {
            try {
                if (!java.nio.file.Files.exists(envPath)) continue;
                for (String line : java.nio.file.Files.readAllLines(envPath)) {
                    line = line.trim();
                    if (line.startsWith("export ")) line = line.substring(7).trim();
                    if (line.startsWith("GROQ_API_KEY=")) {
                        groqApiKey = line.substring("GROQ_API_KEY=".length()).trim();
                        if ((groqApiKey.startsWith("\"") && groqApiKey.endsWith("\""))
                                || (groqApiKey.startsWith("'") && groqApiKey.endsWith("'"))) {
                            groqApiKey = groqApiKey.substring(1, groqApiKey.length() - 1);
                        }
                        if (!groqApiKey.isBlank()) return;
                    }
                }
            } catch (Exception ignored) {}
        }
    }
}
