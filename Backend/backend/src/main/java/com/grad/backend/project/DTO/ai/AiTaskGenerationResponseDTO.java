package com.grad.backend.project.DTO.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiTaskGenerationResponseDTO {
    private String projectSummary;
    private List<AiGeneratedPhaseDTO> phases;
}
