package com.grad.backend.project.DTO;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProjectProposalRequest {
    private Long clientId;
    private String projectTitle;
    private String projectType;
    private String problemSolved;
    private String description;
    private String mainFeatures;
    private String userRoles;
    private String scalability;
    private Integer durationDays;
    private BigDecimal budgetUsd;
    private Boolean ndaRequired;
    private String codeOwnership;
    private String maintenancePeriod;
}