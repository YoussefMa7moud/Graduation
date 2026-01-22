package com.grad.backend.project.Controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.DTO.SubmissionResponseDTO;
import com.grad.backend.project.DTO.SubmitToCompanyRequest;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.service.ProposalSubmissionService;
import lombok.RequiredArgsConstructor;

import java.util.List;

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
    
    List<SubmissionResponseDTO> dtos = submissions.stream().map(s -> SubmissionResponseDTO.builder()
            .id(s.getId())
            .status(s.getStatus().name())
            .proposalId(s.getProposal().getId())
            .companyId(s.getSoftwareCompany().getId())
            .proposalTitle(s.getProposal().getProjectTitle()) 
            .companyName(s.getSoftwareCompany().getName())
            .updatedAt(s.getUpdatedAt())
            .build())
            .toList();
            
    return ResponseEntity.ok(dtos);
}


}