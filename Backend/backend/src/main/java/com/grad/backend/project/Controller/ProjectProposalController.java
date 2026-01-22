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

    // ✅ CREATE
    @PostMapping("/create")
    public ResponseEntity<ProjectProposal> submitProposal(
            @RequestBody ProjectProposalRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ProjectProposal created =
                proposalService.createProposal(request, currentUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ✅ GET ALL MY PROPOSALS (FIXED)
    @GetMapping("/MyProposals/{clientId}")
    public ResponseEntity<?> getMyProposals(
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                proposalService.getProposalsByClientId(currentUser.getId())
        );
    }

    // ✅ GET PROPOSAL BY ID
    @GetMapping("/{proposalId}")
    public ResponseEntity<?> getProposalById(
            @PathVariable Long proposalId,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(
                proposalService.getProposalById(proposalId, proposalId)
        );
    }

    // ✅ UPDATE PROPOSAL
    @PutMapping("/update/{proposalId}")
    public ResponseEntity<?> updateProposal(
            @PathVariable Long proposalId,
            @RequestBody ProjectProposalRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        proposalService.updateProposal(proposalId, request, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    // ✅ DELETE PROPOSAL
    @DeleteMapping("/delete/{proposalId}")
    public ResponseEntity<?> deleteProposal(
            @PathVariable Long proposalId,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        proposalService.deleteProposal(proposalId, currentUser.getId());
        return ResponseEntity.ok().build();
    }



}