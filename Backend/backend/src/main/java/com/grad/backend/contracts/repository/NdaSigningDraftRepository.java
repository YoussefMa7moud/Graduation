package com.grad.backend.contracts.repository;

import com.grad.backend.contracts.entity.NdaSigningDraft;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NdaSigningDraftRepository extends JpaRepository<NdaSigningDraft, Long> {
    Optional<NdaSigningDraft> findBySubmissionId(Long submissionId);
}
