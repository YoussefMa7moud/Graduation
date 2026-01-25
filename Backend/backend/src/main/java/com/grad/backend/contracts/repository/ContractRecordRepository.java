package com.grad.backend.contracts.repository;

import com.grad.backend.contracts.entity.ContractRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractRecordRepository extends JpaRepository<ContractRecord, Long> {
    List<ContractRecord> findBySubmissionId(Long submissionId);
    List<ContractRecord> findByCompanyIdOrderBySignedAtDesc(Long companyId);
    Optional<ContractRecord> findByIdAndCompanyId(Long id, Long companyId);
}
