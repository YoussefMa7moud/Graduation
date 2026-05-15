package com.grad.backend.project.DTO.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiGeneratedPhaseDTO {
    private String phase;
    private String milestone;
    private List<AiGeneratedTaskDTO> tasks;
}
