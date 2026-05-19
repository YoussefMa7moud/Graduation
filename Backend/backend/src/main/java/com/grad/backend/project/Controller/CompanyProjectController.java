package com.grad.backend.project.Controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.DTO.AssignProjectRequest;
import com.grad.backend.project.DTO.CompanyProjectDTO;
import com.grad.backend.project.DTO.ExtractClauseOclResponse;
import com.grad.backend.project.DTO.GenerateGuidelinesResponse;
import com.grad.backend.project.service.CompanyProjectService;
import com.grad.backend.project.service.ContractClauseOclService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company-projects")
@RequiredArgsConstructor
public class CompanyProjectController {

    private final CompanyProjectService companyProjectService;
    private final ContractClauseOclService contractClauseOclService;

    @PostMapping("/contracts/{contractRecordId}/extract-clause-ocl")
    public ResponseEntity<?> extractClauseOcl(
            @PathVariable Long contractRecordId,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }
        try {
            ExtractClauseOclResponse response =
                    contractClauseOclService.extractFromContractRecord(contractRecordId, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/assign")
    public ResponseEntity<CompanyProjectDTO> assignProject(
            @AuthenticationPrincipal User user,
            @RequestBody AssignProjectRequest request) {
        CompanyProjectDTO dto = companyProjectService.assignProject(request, user.getId());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/company")
    public ResponseEntity<List<CompanyProjectDTO>> getCompanyProjects(@AuthenticationPrincipal User user) {
        List<CompanyProjectDTO> projects = companyProjectService.getCompanyProjects(user.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/pm")
    public ResponseEntity<List<CompanyProjectDTO>> getPMProjects(@AuthenticationPrincipal User user) {
        List<CompanyProjectDTO> projects = companyProjectService.getPMProjects(user.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyProjectDTO> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            CompanyProjectDTO dto = companyProjectService.getProjectById(id, user.getId());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/generate-guidelines")
    public ResponseEntity<?> generateGuidelines(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }
        try {
            GenerateGuidelinesResponse response = companyProjectService.generateGuidelinesAndSummary(id, user.getId());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
