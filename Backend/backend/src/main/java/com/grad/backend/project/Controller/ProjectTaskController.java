package com.grad.backend.project.Controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.DTO.GenerateTasksFromProposalRequest;
import com.grad.backend.project.DTO.ProjectTaskDTO;
import com.grad.backend.project.DTO.UpdateProjectTaskRequest;
import com.grad.backend.project.service.ProjectTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company-projects/{projectId}/tasks")
@RequiredArgsConstructor
public class ProjectTaskController {

    private final ProjectTaskService projectTaskService;

    @GetMapping
    public ResponseEntity<?> listTasks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(projectTaskService.getTasksForProject(projectId, user.getId()));
    }

    @PostMapping("/generate-from-proposal")
    public ResponseEntity<?> generateFromProposal(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GenerateTasksFromProposalRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        try {
            List<ProjectTaskDTO> tasks = projectTaskService.generateTasksFromProposal(
                    projectId, user.getId(), request);
            return ResponseEntity.ok(Map.of(
                    "message", "Tasks generated successfully",
                    "count", tasks.size(),
                    "tasks", tasks
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<ProjectTaskDTO> updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProjectTaskRequest request) {
        try {
            return ResponseEntity.ok(projectTaskService.updateTask(projectId, taskId, user.getId(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user) {
        try {
            projectTaskService.deleteTask(projectId, taskId, user.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
