package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractDraftResponse {
    private Long id;
    private Long submissionId;
    private String contractPayloadJson;
    private Boolean aiValidated;
    private Boolean oclValidated;
    private Boolean sentToClient;
    private LocalDateTime clientSignedAt;
    private LocalDateTime companySignedAt;
    private String validationResultsJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
