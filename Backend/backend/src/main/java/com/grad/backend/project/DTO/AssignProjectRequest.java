package com.grad.backend.project.DTO;

import lombok.Data;

@Data
public class AssignProjectRequest {
    private Long contractRecordId;
    private Long projectManagerId;
    private String oclRules;
    private String guidelines;
}
