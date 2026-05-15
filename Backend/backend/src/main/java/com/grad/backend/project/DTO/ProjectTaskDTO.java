package com.grad.backend.project.DTO;

import com.grad.backend.project.enums.ProjectPhase;
import com.grad.backend.project.enums.TaskPriority;
import com.grad.backend.project.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectTaskDTO {
    private Long id;
    private Long companyProjectId;
    private String title;
    private String description;
    private TaskPriority priority;
    private String estimatedDuration;
    private String suggestedAssignee;
    private TaskStatus status;
    private List<String> dependencies;
    private String milestone;
    private ProjectPhase phase;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
