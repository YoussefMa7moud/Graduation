package com.grad.backend.project.Controller;

import com.grad.backend.project.DTO.ProjectProposalRequest;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.service.ProjectProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// Make sure you import YOUR User entity or UserDetails implementation
// Replace 'com.grad.backend.auth.User' with your actual User class path
import com.grad.backend.Auth.entity.User; 

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class ProjectProposalController {

    private final ProjectProposalService proposalService;

   @PostMapping("/create")
public ResponseEntity<ProjectProposal> submitProposal(
    @RequestBody ProjectProposalRequest request,
    @AuthenticationPrincipal User currentUser 
) {
    if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // FIX: Changed from UUID to Long
    Long authenticatedClientId = currentUser.getId();
    // FIX: Now matches the new service signature
    ProjectProposal created = proposalService.createProposal(request, authenticatedClientId);
    return new ResponseEntity<>(created, HttpStatus.CREATED);
}

    @GetMapping("/{id}")
    public ResponseEntity<ProjectProposal> getProposal(@PathVariable Long id) {
        return ResponseEntity.ok(proposalService.getProposalById(id));
    }

    @GetMapping("/MyProposals/{id}")
    public ResponseEntity<ProjectProposal> getMyProposals(@PathVariable Long id) {
        return ResponseEntity.ok(proposalService.getProposalById(id));
    }
}