package com.grad.backend.contracts.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SignedProjectDTO {
    private Long id; // ContractRecord ID (or Submission ID if grouping)
    private String projectName; // From ProjectProposal
    private String projectType; // From ProjectProposal
    private String companyName; // From Company
    private LocalDateTime signedAt; // From ContractRecord
    private String fileName; // From ContractRecord
    private Long fileSize; // Estimate or store
    private String contractType; // NDA, MSA, etc.
}
