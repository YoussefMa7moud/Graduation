package com.grad.backend.project.DTO.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiSingleConstraintCheckDTO {
    private Boolean violated;
    private String whyViolated;
    private String documentConflict;
}
