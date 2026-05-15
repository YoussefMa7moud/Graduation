package com.grad.backend.project.DTO;

import com.grad.backend.project.enums.TaskStatus;
import lombok.Data;

@Data
public class UpdateProjectTaskRequest {
    private TaskStatus status;
}
