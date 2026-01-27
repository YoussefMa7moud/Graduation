package com.grad.backend.policy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicySaveRequest {
    private String policyName;
    private String legalFramework;
    private String policyText;
    private String oclCode;
    private String explanation;
    private String articleRef;
    private String category;
    private List<String> keywords;
}
