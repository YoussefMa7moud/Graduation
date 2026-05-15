package com.grad.backend.project.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenerateGuidelinesResponse {
    private String message;
    private String projectSummary;
    private String guidelines;
}
