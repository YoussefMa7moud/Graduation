package com.grad.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.contracts.dto.ViolationDTO;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class TranslationService {

    @Value("${app.groq.api.key:}")
    private String groqApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TranslationService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000); // 10 seconds
        factory.setReadTimeout(60_000);    // 60 seconds
        this.restTemplate = new RestTemplate(factory);
    }
    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private static final String MODEL = "llama-3.3-70b-versatile";

    @PostConstruct
    public void init() {
        if (groqApiKey == null || groqApiKey.isBlank() || groqApiKey.equals("${GROQ_API_KEY}")) {
            log.info("Groq API Key not found in environment. Attempting to load from .env file...");
            
            // Try multiple locations for .env
            java.util.List<java.nio.file.Path> candidates = new java.util.ArrayList<>();

            // Common relative paths from various run directories
            candidates.add(java.nio.file.Paths.get(".env"));
            candidates.add(java.nio.file.Paths.get("Backend/backend/.env"));
            candidates.add(java.nio.file.Paths.get("backend/.env"));
            candidates.add(java.nio.file.Paths.get("../.env"));

            // Walk up parent directories and try ".env" (covers running from target/, etc.)
            try {
                java.nio.file.Path here = java.nio.file.Paths.get("").toAbsolutePath().normalize();
                java.nio.file.Path p = here;
                for (int i = 0; i < 6 && p != null; i++) {
                    candidates.add(p.resolve(".env"));
                    candidates.add(p.resolve("Backend").resolve("backend").resolve(".env"));
                    candidates.add(p.resolve("backend").resolve(".env"));
                    p = p.getParent();
                }
            } catch (Exception ignored) {}

            java.nio.file.Path loadedFrom = null;
            for (java.nio.file.Path envPath : candidates) {
                try {
                    if (!java.nio.file.Files.exists(envPath)) continue;
                    log.info("Found .env candidate at: {}", envPath.toAbsolutePath());
                    for (String line : java.nio.file.Files.readAllLines(envPath)) {
                        String raw = line;
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        // Support: "GROQ_API_KEY=...", "export GROQ_API_KEY=..."
                        if (line.startsWith("export ")) line = line.substring("export ".length()).trim();

                        if (line.startsWith("GROQ_API_KEY=")) {
                            groqApiKey = line.substring("GROQ_API_KEY=".length()).trim();
                            // Remove quotes if present
                            if ((groqApiKey.startsWith("\"") && groqApiKey.endsWith("\""))
                                    || (groqApiKey.startsWith("'") && groqApiKey.endsWith("'"))) {
                                groqApiKey = groqApiKey.substring(1, groqApiKey.length() - 1);
                            }
                            if (!groqApiKey.isBlank()) {
                                loadedFrom = envPath.toAbsolutePath();
                                break;
                            } else {
                                log.warn("GROQ_API_KEY was blank in {}", envPath.toAbsolutePath());
                            }
                        } else if (raw != null && raw.trim().startsWith("GROQ_API_KEY")) {
                            // Helpful diagnostics when line is malformed (e.g., spaces around '=')
                            log.debug("Ignoring malformed GROQ_API_KEY line in {}: {}", envPath.toAbsolutePath(), raw);
                        }
                    }
                    if (loadedFrom != null) break;
                } catch (Exception e) {
                    log.warn("Failed to read .env at {}: {}", envPath.toAbsolutePath(), e.getMessage());
                }
            }

            if (loadedFrom != null) {
                log.info("Successfully loaded GROQ_API_KEY from {}", loadedFrom);
            }
        }
        
        if (groqApiKey != null && groqApiKey.length() > 6) {
            log.info("Groq API Key initialized: {}...", groqApiKey.substring(0, 6));
        } else {
            log.error("Groq API Key initialization FAILED. Translation service will not work.");
        }
    }

    // ─── Language Detection ───────────────────────────────────────────────────

    public boolean isArabic(String text) {
        if (text == null || text.isBlank()) return false;
        long arabicChars = text.chars()
                .filter(c -> c >= 0x0600 && c <= 0x06FF)
                .count();
        return arabicChars > (text.length() * 0.3);
    }

    // ─── Translation Methods ──────────────────────────────────────────────────

    public String translateToEnglish(String arabicText) {
    if (arabicText == null || arabicText.isBlank()) return arabicText;
    
    // If it's already primarily English, don't waste an API call
    if (!isArabic(arabicText)) {
        log.debug("Text is already English, skipping translation");
        return arabicText;
    }
    
    // If translation is not configured or fails, fall back to original text
    if (groqApiKey == null || groqApiKey.isBlank()) {
        log.warn("Groq API Key missing; skipping Arabic→English translation fallback");
        return arabicText;
    }

    String prompt = "Translate the following Arabic legal contract clause to English. " +
            "Preserve all legal terminology accurately. " +
            "Return only the translated text, nothing else, no explanations:\n\n" + arabicText;
    try {
        return callGroq(prompt);
    } catch (Exception e) {
        log.warn("Arabic→English translation failed; falling back to original text. reason={}", e.getMessage());
        return arabicText;
    }
}

    public String translateToArabic(String englishText) {
    if (englishText == null || englishText.isBlank()) return englishText;
    
    // If it's already primarily Arabic, don't waste an API call
    if (isArabic(englishText)) {
        log.debug("Text is already Arabic, skipping translation");
        return englishText;
    }
    
    // If translation is not configured or fails, fall back to original text
    if (groqApiKey == null || groqApiKey.isBlank()) {
        log.warn("Groq API Key missing; skipping English→Arabic translation fallback");
        return englishText;
    }

    String prompt = "Translate the following legal text to Arabic. " +
            "The text may contain legal article references, law terms, or mixed content. " +
            "Translate everything to Arabic accurately. " +
            "If any part is already in Arabic, keep it as is. " +
            "Return only the translated Arabic text, nothing else:\n\n" + englishText;
    try {
        return callGroq(prompt);
    } catch (Exception e) {
        log.warn("English→Arabic translation failed; falling back to original text. reason={}", e.getMessage());
        return englishText;
    }
}

    // ─── Batch Violation Translation ─────────────────────────────────────────

   public List<ViolationDTO> translateViolationsToArabic(List<ViolationDTO> violations) {
    for (ViolationDTO v : violations) {
        try {
            // clauseText is already Arabic — skip translation
            if (v.getReason() != null && !v.getReason().isBlank()) {
                v.setReason(translateToArabic(v.getReason()));
            }
            if (v.getSuggestion() != null && !v.getSuggestion().isBlank()) {
                v.setSuggestion(translateToArabic(v.getSuggestion()));
            }
            // type stays as "LAW" — never translate
        } catch (Exception e) {
            log.error("Failed to translate violation for clause {}: {}", v.getClauseId(), e.getMessage());
        }
    }
    return violations;
}
    // ─── Groq API Call ────────────────────────────────────────────────────────

    private String callGroq(String prompt) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.error("Groq API Key is missing! Translation will fail.");
            throw new RuntimeException("Translation service not configured (missing API key)");
        }

        try {
            log.debug("Calling Groq with prompt: {}", prompt.substring(0, Math.min(prompt.length(), 50)) + "...");
            Map<String, Object> message = Map.of(
                    "role", "user",
                    "content", prompt
            );

            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "messages", List.of(message),
                    "temperature", 0.1,
                    "max_tokens", 2048 // Increased for longer legal clauses
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    GROQ_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();
                
                if (content == null || content.isBlank()) {
                    log.warn("Groq returned empty content for prompt");
                    throw new RuntimeException("Translation returned empty response");
                }
                return content;
            } else {
                log.error("Groq API returned error status: {}", response.getStatusCode());
                throw new RuntimeException("Groq API error: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Groq API call failed: {}", e.getMessage());
            throw new RuntimeException("Translation failed: " + e.getMessage());
        }
    }
}