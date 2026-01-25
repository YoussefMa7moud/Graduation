package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViolationDTO {
    private String clauseId;
    private String clauseText;
    private Map<String, String> violatedLaw;
    private Double confidence;
    private String reason;
    private String suggestion;
}
