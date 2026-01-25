package com.grad.backend.contracts.repository;

import com.grad.backend.contracts.entity.ContractChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractChatMessageRepository extends JpaRepository<ContractChatMessage, Long> {
    List<ContractChatMessage> findBySubmissionIdOrderByCreatedAtAsc(Long submissionId);
}
