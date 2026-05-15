package com.grad.backend.project.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.project.DTO.CompanyProjectDTO;
import com.grad.backend.project.DTO.ai.AiGuidelinesResponseDTO;
import com.grad.backend.project.prompt.GuidelinesGenerationPrompt;
import com.grad.backend.service.GroqApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectGuidelinesAiService {

    private final GroqApiClient groqApiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiGuidelinesResponseDTO generate(CompanyProjectDTO project) {
        String userPrompt = GuidelinesGenerationPrompt.buildUserPrompt(
                project.getProjectTitle(),
                project.getProjectDescription(),
                project.getMainFeatures(),
                project.getProjectType(),
                project.getDurationDays(),
                project.getBudgetUsd(),
                project.getClientName(),
                project.getContractName(),
                project.getOclRules(),
                project.getGuidelines()
        );

        try {
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", GuidelinesGenerationPrompt.SYSTEM_INSTRUCTION),
                    Map.of("role", "user", "content", userPrompt)
            );

            String content = groqApiClient.chatCompletion(messages, 0.25, 4096, true);
            String json = TaskGenerationAiService.extractJson(content);
            AiGuidelinesResponseDTO parsed = objectMapper.readValue(json, AiGuidelinesResponseDTO.class);

            if (parsed.getProjectSummary() == null || parsed.getProjectSummary().isBlank()) {
                throw new RuntimeException("AI response missing projectSummary");
            }
            if (parsed.getGuidelines() == null || parsed.getGuidelines().isBlank()) {
                throw new RuntimeException("AI response missing guidelines");
            }

            return parsed;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Guidelines generation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to generate guidelines: " + e.getMessage(), e);
        }
    }
}
