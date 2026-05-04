package com.grad.backend.project.Controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.DTO.AssignProjectRequest;
import com.grad.backend.project.DTO.CompanyProjectDTO;
import com.grad.backend.project.service.CompanyProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company-projects")
@RequiredArgsConstructor
public class CompanyProjectController {

    private final CompanyProjectService companyProjectService;

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
}
