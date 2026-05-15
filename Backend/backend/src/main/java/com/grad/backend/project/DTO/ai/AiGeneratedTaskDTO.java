package com.grad.backend.project.DTO.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiGeneratedTaskDTO {
    private String title;
    private String description;
    private String priority;
    private String estimatedDuration;
    private String suggestedAssignee;
    private String status;
    private List<String> dependencies;
    private String milestone;
}
