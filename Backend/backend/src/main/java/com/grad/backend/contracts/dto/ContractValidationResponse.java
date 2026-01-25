package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractValidationResponse {
    private Boolean isValid;
    private Double complianceScore;
    private List<ViolationDTO> violations;
    private String message;
}
