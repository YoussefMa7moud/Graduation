package com.grad.backend.contracts.repository;

import com.grad.backend.contracts.entity.ContractDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractDraftRepository extends JpaRepository<ContractDraft, Long> {
    Optional<ContractDraft> findBySubmissionId(Long submissionId);
}
