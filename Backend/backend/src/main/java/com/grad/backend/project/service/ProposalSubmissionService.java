package com.grad.backend.project.service;

import com.grad.backend.Auth.entity.ClientCompany;
import com.grad.backend.Auth.entity.ClientPerson;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.project.DTO.NdaPartiesDTO;
import com.grad.backend.project.DTO.NdaPartiesResponse;
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
    private final ClientCompanyRepository clientCompanyRepo;
    private final ClientPersonRepository clientPersonRepo;

    @Transactional
    public ProposalSubmission sendProposalToCompany(Long proposalId, Long softwareCompanyId, User currentUser) {

        // 1. Check for existing submission first
        Optional<ProposalSubmission> existingSubmission = submissionRepository
                .findByClient_IdAndSoftwareCompany_IdAndProposal_Id(
                        currentUser.getId(),
                        softwareCompanyId,
                        proposalId);

        if (existingSubmission.isPresent()) {
            // UPDATE LOGIC: Only change mutable state
            ProposalSubmission submission = existingSubmission.get();
            submission.setStatus(SubmissionStatus.RESUBMITTED);
            submission.setRejectionNote(null);
            submission.setRead(false);

            // Sync Proposal Status
            ProjectProposal proposal = submission.getProposal();
            proposal.setStatus("Enrolled");
            proposalRepository.save(proposal);

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

            // Sync Proposal Status
            proposal.setStatus("Enrolled");
            proposalRepository.save(proposal);

            return submissionRepository.save(newSubmission);
        }
    }

    public List<ProposalSubmission> getMySubmissions(Long clientId) {
        return submissionRepository.findByClient_Id(clientId);
    }

    @Transactional
    public void updateStatus(Long submissionId, SubmissionStatus status, String note) {
        ProposalSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setStatus(status);
        if (note != null) {
            submission.setRejectionNote(note);
        }

        // Sync Proposal Status
        ProjectProposal proposal = submission.getProposal();
        if (status == SubmissionStatus.REJECTED_WITH_NOTE) {
            proposal.setStatus("Rejected with Note");
        } else if (status == SubmissionStatus.REJECTED) {
            proposal.setStatus("Rejected");
        } else if (status == SubmissionStatus.ACCEPTED) {
            proposal.setStatus("Accepted"); // Or Enrolled/Active
        } else if (status == SubmissionStatus.WAITING_FOR_COMPANY || status == SubmissionStatus.RESUBMITTED) {
            proposal.setStatus("Enrolled");
        } else {
            // for others like REVIEWING, VALIDATION etc, keep as Enrolled or update as
            // needed
            proposal.setStatus("Enrolled");
        }
        proposalRepository.save(proposal);

        submissionRepository.save(submission);
    }

    @Transactional
    public void deleteSubmission(Long submissionId) {
        ProposalSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        ProjectProposal proposal = submission.getProposal();
        proposal.setStatus("Pending");
        proposalRepository.save(proposal);

        submissionRepository.deleteById(submissionId);
    }

    public List<ProposalSubmission> getSubmissionsForCompany(Long companyId) {
        return submissionRepository.findBySoftwareCompany_Id(companyId);
    }

    public String getClientDisplayName(Long userId, ClientType type) {
        if (type == ClientType.COMPANY) {
            return clientCompanyRepo.findById(userId)
                    .map(ClientCompany::getCompanyName)
                    .orElse("Unknown Company");
        } else {
            return clientPersonRepo.findById(userId)
                    .map(cp -> cp.getFirstName() + " " + cp.getLastName())
                    .orElse("Unknown Individual");
        }
    }

    @Transactional(readOnly = true)
    public NdaPartiesResponse getNdaParties(Long submissionId, Long currentUserId) {
        ProposalSubmission s = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        Long clientId = s.getClient().getId();
        Long companyId = s.getSoftwareCompany().getId();
        if (!currentUserId.equals(clientId) && !currentUserId.equals(companyId)) {
            throw new RuntimeException("Not authorized to view this submission");
        }
        String actor = currentUserId.equals(clientId) ? "client" : "company";

        Company comp = s.getSoftwareCompany();
        User compUser = comp.getUser();
        NdaPartiesDTO partyA = NdaPartiesDTO.builder()
                .name(comp.getName() != null ? comp.getName() : "")
                .signatory(compUser.getFirstName() + " " + compUser.getLastName())
                .title(comp.getTitle() != null ? comp.getTitle() : "")
                .email(compUser.getEmail())
                .details(comp.getCompanyRegNo() != null ? "CR: " + comp.getCompanyRegNo() : "")
                .build();

        User cl = s.getClient();
        NdaPartiesDTO partyB;
        if (s.getClientType() == ClientType.COMPANY) {
            ClientCompany cc = clientCompanyRepo.findById(cl.getId())
                    .orElseThrow(() -> new RuntimeException("Client company not found"));
            partyB = NdaPartiesDTO.builder()
                    .name(cc.getCompanyName() != null ? cc.getCompanyName() : "")
                    .signatory(cl.getFirstName() + " " + cl.getLastName())
                    .title(cc.getTitle() != null ? cc.getTitle() : "")
                    .email(cl.getEmail())
                    .details(cc.getCompanyRegNo() != null ? "CR: " + cc.getCompanyRegNo() : "")
                    .build();
        } else {
            ClientPerson cp = clientPersonRepo.findById(cl.getId())
                    .orElseThrow(() -> new RuntimeException("Client person not found"));
            partyB = NdaPartiesDTO.builder()
                    .name("Individual Client")
                    .signatory(cp.getFirstName() + " " + cp.getLastName())
                    .title("Authorized Representative")
                    .email(cl.getEmail())
                    .details(cp.getNationalId() != null ? "National ID: " + cp.getNationalId() : "")
                    .build();
        }

        return NdaPartiesResponse.builder()
                .partyA(partyA)
                .partyB(partyB)
                .actor(actor)
                .build();
    }

    public String verifyActor(Long submissionId, Long userId) {
        ProposalSubmission s = submissionRepository.findById(submissionId)
                .orElse(null);
        if (s == null)
            return "none";
        if (userId.equals(s.getClient().getId()))
            return "client";
        if (userId.equals(s.getSoftwareCompany().getId()))
            return "company";
        return "none";
    }
}