package com.grad.backend.project.repository;

import com.grad.backend.project.entity.ProposalSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProposalSubmissionRepository extends JpaRepository<ProposalSubmission, Long> {
    // Note the underscores: findBy[Entity]_[Field]
    Optional<ProposalSubmission> findByClient_IdAndSoftwareCompany_IdAndProposal_Id(
            Long clientId, Long softwareCompanyId, Long proposalId);

    // If you need a specific one for the Workspace
    Optional<ProposalSubmission> findByIdAndClient_Id(Long id, Long clientId);

    List<ProposalSubmission> findByClient_Id(Long clientId);

    List<ProposalSubmission> findBySoftwareCompany_Id(Long companyId);

    List<ProposalSubmission> findByProposal_Id(Long proposalId);
}