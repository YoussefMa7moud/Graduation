package com.grad.backend.project.DTO.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiGuidelinesResponseDTO {
    private String projectSummary;
    private String guidelines;
}
