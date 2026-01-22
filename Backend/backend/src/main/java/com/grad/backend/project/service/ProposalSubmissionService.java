package com.grad.backend.project.service;

import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.enums.ClientType;
import com.grad.backend.project.enums.SubmissionStatus;
import com.grad.backend.project.repository.ProjectProposalRepository;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProposalSubmissionService {

    private final ProposalSubmissionRepository submissionRepository;
    private final ProjectProposalRepository proposalRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public ProposalSubmission sendProposalToCompany(Long proposalId, Long softwareCompanyId, User currentUser) {
        
        // 1. Check for existing submission first
        Optional<ProposalSubmission> existingSubmission = submissionRepository
                .findByClient_IdAndSoftwareCompany_IdAndProposal_Id(
                        currentUser.getId(), 
                        softwareCompanyId, 
                        proposalId
                );

        if (existingSubmission.isPresent()) {
            // UPDATE LOGIC: Only change mutable state
            ProposalSubmission submission = existingSubmission.get();
            submission.setStatus(SubmissionStatus.RESUBMITTED);
            submission.setRejectionNote(null);
            submission.setRead(false); 
            
            // saveAndFlush ensures the transaction updates the DB immediately
            return submissionRepository.saveAndFlush(submission); 
        } else {
            // CREATE LOGIC
            ProjectProposal proposal = proposalRepository.findById(proposalId)
                    .orElseThrow(() -> new RuntimeException("Proposal not found"));

            Company targetCompany = companyRepository.findById(softwareCompanyId)
                    .orElseThrow(() -> new RuntimeException("Software Company not found"));

            ClientType type = (currentUser.getRole() == UserRole.CLIENT_COMPANY || 
                               currentUser.getRole() == UserRole.ROLECLIENT_COMPANY) 
                              ? ClientType.COMPANY 
                              : ClientType.INDIVIDUAL;

            ProposalSubmission newSubmission = ProposalSubmission.builder()
                    .client(currentUser)
                    .softwareCompany(targetCompany)
                    .proposal(proposal)
                    .clientType(type)
                    .status(SubmissionStatus.WAITING_FOR_COMPANY)
                    .isRead(false)
                    .build();

            return submissionRepository.save(newSubmission);
        }
    }


public List<ProposalSubmission> getMySubmissions(Long clientId) {
    return submissionRepository.findByClient_Id(clientId);
}
    

    
}