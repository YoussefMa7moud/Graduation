package com.grad.backend.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor 
public class SubmissionResponseDTO {
    // Basic Submission Info
    private Long id;
    private String status;
    private Long proposalId;
    private Long companyId;
    private LocalDateTime updatedAt;
    private LocalDateTime proposedAt;
    
    // Project Specification Details (For the Modal)
    private String proposalTitle;
    private String projectType;
    private String problemSolved;
    private String content; // Maps to Description
    private String mainFeatures;
    private String userRoles;
    private String scalability;
    private Integer durationDays;
    private BigDecimal budgetUsd;
    private Boolean ndaRequired;
    private String codeOwnership;
    private String maintenancePeriod; 

    // Client Info (For the Table and Modal)
    private String clientType;
    private String clientName;
    private String clientCompanyName; // The title if the client is a company
    private String companyName;        // The name of the company receiving the proposal
}