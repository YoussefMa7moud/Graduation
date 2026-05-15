package com.grad.backend.project.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.project.DTO.ai.AiTaskGenerationResponseDTO;
import com.grad.backend.project.prompt.TaskGenerationPrompt;
import com.grad.backend.service.GroqApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskGenerationAiService {

    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]");

    private final GroqApiClient groqApiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.tasks.max-proposal-chars:50000}")
    private int maxProposalChars;

    public String sanitizeProposalText(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("Proposal text is required");
        }
        String cleaned = CONTROL_CHARS.matcher(raw.trim()).replaceAll("");
        if (cleaned.isBlank()) {
            throw new IllegalArgumentException("Proposal text is empty");
        }
        if (cleaned.length() > maxProposalChars) {
            cleaned = cleaned.substring(0, maxProposalChars);
            log.warn("Proposal text truncated to {} characters", maxProposalChars);
        }
        return cleaned;
    }

    public AiTaskGenerationResponseDTO generateTasksFromProposal(
            String projectTitle,
            String projectContext,
            String proposalText) {

        String safeProposal = sanitizeProposalText(proposalText);
        String userPrompt = TaskGenerationPrompt.buildUserPrompt(projectTitle, projectContext, safeProposal);

        try {
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", TaskGenerationPrompt.SYSTEM_INSTRUCTION),
                    Map.of("role", "user", "content", userPrompt)
            );

            String content = groqApiClient.chatCompletion(messages, 0.2, 8192, true);
            String json = extractJson(content);
            AiTaskGenerationResponseDTO parsed = objectMapper.readValue(json, AiTaskGenerationResponseDTO.class);

            if (parsed.getPhases() == null || parsed.getPhases().isEmpty()) {
                throw new RuntimeException("AI response contained no phases");
            }

            return parsed;

        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI task generation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to generate tasks from proposal: " + e.getMessage(), e);
        }
    }

    static String extractJson(String content) {
        String trimmed = content.trim();
        if (trimmed.startsWith("```")) {
            int start = trimmed.indexOf('{');
            int end = trimmed.lastIndexOf('}');
            if (start >= 0 && end > start) {
                return trimmed.substring(start, end + 1);
            }
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }
}
