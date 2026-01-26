package com.grad.backend.Auth.controller;

import com.grad.backend.Auth.entity.ProjectManager;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.service.ProjectManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company/pms")
@RequiredArgsConstructor
public class ProjectManagerController {

    private final ProjectManagerService projectManagerService;

    @GetMapping
    public ResponseEntity<List<ProjectManager>> getProjectManagers(@AuthenticationPrincipal User currentUser) {
        // We pass the logged-in user ID (Company Admin) to service
        return ResponseEntity.ok(projectManagerService.getProjectManagers(currentUser.getId()));
    }

    @PutMapping("/{pmId}")
    public ResponseEntity<?> updateProjectManager(
            @PathVariable Long pmId,
            @RequestBody Map<String, String> request) {

        String firstName = request.get("firstName");
        String lastName = request.get("lastName");
        String email = request.get("email");

        projectManagerService.updateProjectManager(pmId, firstName, lastName, email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pmId}")
    public ResponseEntity<?> deleteProjectManager(@PathVariable Long pmId) {
        projectManagerService.deleteProjectManager(pmId);
        return ResponseEntity.ok().build();
    }
}
