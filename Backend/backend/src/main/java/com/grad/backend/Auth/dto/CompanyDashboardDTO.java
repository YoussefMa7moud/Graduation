package com.grad.backend.Auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDashboardDTO {
    private long totalContracts;
    private long activeRequests;
    private long totalProjectManagers;
}
