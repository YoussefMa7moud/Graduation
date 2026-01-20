package com.grad.backend.project.DTO;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProjectProposalRequest {
    private UUID clientId;
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