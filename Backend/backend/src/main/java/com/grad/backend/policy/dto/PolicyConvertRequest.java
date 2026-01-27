package com.grad.backend.policy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyConvertRequest {
    @JsonProperty("policyName")
    private String policyName;
    
    @JsonProperty("legalFramework")
    private String legalFramework;
    
    @JsonProperty("policyText")
    private String policyText;
}
