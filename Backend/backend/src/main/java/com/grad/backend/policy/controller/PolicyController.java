package com.grad.backend.policy.controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.policy.dto.*;
import com.grad.backend.policy.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final CompanyRepository companyRepository;

    @PostMapping("/convert")
    public ResponseEntity<PolicyConvertResponse> convertPolicy(
            @RequestBody PolicyConvertRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            PolicyConvertResponse response = policyService.convertPolicy(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<PolicyResponse> savePolicy(
            @RequestBody PolicySaveRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Get company name
            String companyName = "Company_" + currentUser.getId();
            Optional<Company> companyOpt = companyRepository.findById(currentUser.getId());
            if (companyOpt.isPresent() && companyOpt.get().getName() != null) {
                companyName = companyOpt.get().getName();
            }

            PolicyResponse response = policyService.savePolicy(request, currentUser.getId(), companyName);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PolicyResponse>> getPolicies(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<PolicyResponse> policies = policyService.getPoliciesByCompany(currentUser.getId());
            return ResponseEntity.ok(policies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePolicy(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            policyService.deletePolicy(id, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
