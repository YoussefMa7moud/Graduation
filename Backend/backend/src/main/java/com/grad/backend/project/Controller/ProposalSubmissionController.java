package com.grad.backend.project.Controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.DTO.NdaPartiesResponse;
import com.grad.backend.project.DTO.SubmissionResponseDTO;
import com.grad.backend.project.DTO.SubmitToCompanyRequest;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.enums.SubmissionStatus;
import com.grad.backend.project.enums.ClientType;
import com.grad.backend.project.service.ProposalSubmissionService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class ProposalSubmissionController {

    private final ProposalSubmissionService submissionService;

   @PostMapping("/send-to-company")
public ResponseEntity<SubmissionResponseDTO> submitToCompany(
        @RequestBody SubmitToCompanyRequest request,
        @AuthenticationPrincipal User currentUser
) {
    ProposalSubmission submission = submissionService.sendProposalToCompany(
            request.getProposalId(), 
            request.getSoftwareCompanyId(), 
            currentUser
    );
    
    // Map the entity to the DTO
    SubmissionResponseDTO response = SubmissionResponseDTO.builder()
            .id(submission.getId())
            .status(submission.getStatus().name())
            .proposalId(submission.getProposal().getId())
            .companyId(submission.getSoftwareCompany().getId())
            .updatedAt(submission.getUpdatedAt())
            .build();
    
    return ResponseEntity.ok(response);
}




@GetMapping("/my-submissions")
public ResponseEntity<List<SubmissionResponseDTO>> getMySubmissions(@AuthenticationPrincipal User currentUser) {
    List<ProposalSubmission> submissions = submissionService.getMySubmissions(currentUser.getId());
    
    List<SubmissionResponseDTO> dtos = submissions.stream().map(s -> {
        // Logic to determine client display name
        String displayName = (s.getClient().getFirstName() != null) 
            ? s.getClient().getFirstName() + " " + s.getClient().getLastName()
            : "Unknown Client";

        return SubmissionResponseDTO.builder()
                .id(s.getId())
                .status(s.getStatus().name())
                .proposalId(s.getProposal().getId())
                .companyId(s.getSoftwareCompany().getId())
                .proposalTitle(s.getProposal().getProjectTitle()) 
                .companyName(s.getSoftwareCompany().getName())
                .clientType(s.getClientType().name())
                .clientName(displayName)
                .rejectionNote(s.getRejectionNote())
                .ndaRequired(s.getProposal().getNdaRequired())
                .proposedAt(s.getProposedAt())
                .content(s.getProposal().getDescription())
                .updatedAt(s.getUpdatedAt())
                .build();
    }).toList();
            
    return ResponseEntity.ok(dtos);
}


@GetMapping("/company-queue")
public ResponseEntity<List<SubmissionResponseDTO>> getCompanyQueue(@AuthenticationPrincipal User currentUser) {
    if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    List<ProposalSubmission> submissions = submissionService.getSubmissionsForCompany(currentUser.getId());
    
    List<SubmissionResponseDTO> dtos = submissions.stream().map(s -> {
        ProjectProposal p = s.getProposal();
        
        // Use the service to get the name from the correct table
        String displayName = submissionService.getClientDisplayName(s.getClient().getId(), s.getClientType());

        return SubmissionResponseDTO.builder()
                .id(s.getId())
                .status(s.getStatus().name())
                .proposalId(p.getId())
                .companyId(s.getSoftwareCompany().getId())
                .updatedAt(s.getUpdatedAt())
                .proposedAt(s.getProposedAt())
                
                // Project Details
                .proposalTitle(p.getProjectTitle())
                .projectType(p.getProjectType())
                .problemSolved(p.getProblemSolved())
                .content(p.getDescription())
                .mainFeatures(p.getMainFeatures())
                .userRoles(p.getUserRoles())
                .scalability(p.getScalability())
                .durationDays(p.getDurationDays())
                .budgetUsd(p.getBudgetUsd())
                .ndaRequired(p.getNdaRequired())
                .codeOwnership(p.getCodeOwnership())
                .maintenancePeriod(p.getMaintenancePeriod())
                
                // Client Details
                .clientType(s.getClientType().name())
                .clientName(displayName) // This now comes from the specific profile table
                .clientCompanyName(s.getClientType() == ClientType.COMPANY ? displayName : null)
                .build();
    }).toList();
            
    return ResponseEntity.ok(dtos);
}


@GetMapping("/{id}/nda-parties")
public ResponseEntity<NdaPartiesResponse> getNdaParties(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
    if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    NdaPartiesResponse res = submissionService.getNdaParties(id, currentUser.getId());
    return ResponseEntity.ok(res);
}

@PatchMapping("/{id}/status")
public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam SubmissionStatus status, @RequestParam(required = false) String note) {
    submissionService.updateStatus(id, status, note);
    return ResponseEntity.ok().build();
}

@DeleteMapping("/{id}")
public ResponseEntity<?> delete(@PathVariable Long id) {
    submissionService.deleteSubmission(id);
    return ResponseEntity.ok().build();
}






}