package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveContractDraftRequest {
    private Long submissionId;
    private String contractPayloadJson;
}
