package com.grad.backend.project.DTO;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CompanyProjectDTO {
    private Long id;
    private Long contractRecordId;
    private String contractName;
    private Long projectManagerId;
    private String projectManagerName;
    private boolean ndaSigned;
    private Long proposalId;
    private String projectTitle;
    private String projectDescription;
    private String oclRules;
    private String guidelines;
    private String status;
    private LocalDateTime createdAt;
}
