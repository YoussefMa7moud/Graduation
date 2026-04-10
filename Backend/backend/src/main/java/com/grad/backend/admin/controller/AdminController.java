package com.grad.backend.admin.controller;

import com.grad.backend.Auth.entity.*;
import com.grad.backend.admin.dto.AdminResponseDto;
import com.grad.backend.admin.dto.CreateAdminRequest;
import com.grad.backend.admin.service.AdminService;
import com.grad.backend.project.entity.ProjectProposal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Usually configured securely globally, but just in case
public class AdminController {

    private final AdminService adminService;

    // --- Admin Management ---

    @GetMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminResponseDto>> getAllAdmins() {
        List<AdminResponseDto> admins = adminService.getAllAdmins().stream()
                .map(AdminResponseDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(admins);
    }

    @PostMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminResponseDto> createAdmin(@RequestBody CreateAdminRequest request) {
        User newAdmin = adminService.createAdmin(request);
        return ResponseEntity.ok(AdminResponseDto.fromEntity(newAdmin));
    }

    @DeleteMapping("/admins/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // --- Entity Viewing ---

    @GetMapping("/companies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(adminService.getAllCompanies());
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CompanyEmployee>> getAllEmployees() {
        return ResponseEntity.ok(adminService.getAllEmployees());
    }

    @GetMapping("/clients/persons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientPerson>> getAllClientPersons() {
        return ResponseEntity.ok(adminService.getAllClientPersons());
    }

    @GetMapping("/clients/companies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientCompany>> getAllClientCompanies() {
        return ResponseEntity.ok(adminService.getAllClientCompanies());
    }

    @GetMapping("/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProjectProposal>> getAllProjects() {
        return ResponseEntity.ok(adminService.getAllProjects());
    }
}
