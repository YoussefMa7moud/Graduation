package com.grad.backend.policy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {
    private Long id;
    private String policyName;
    private String legalFramework;
    private String policyText;
    private String oclCode;
    private String explanation;
    private String articleRef;
    private String category;
    private String keywords;
    private String filePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
