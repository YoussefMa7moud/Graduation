package com.grad.backend.Auth.service;

import com.grad.backend.Auth.dto.CompanyDashboardDTO;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.Auth.repository.ProjectManagerRepository;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.enums.SubmissionStatus;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CompanyRepository companyRepository;
    private final ContractRecordRepository contractRepository;
    private final ProposalSubmissionRepository submissionRepository;
    private final ProjectManagerRepository projectManagerRepository;

    public CompanyDashboardDTO getCompanyStats(Long userId) {
        // 1. Get the Company entity linked to this user
        // Assuming the logged-in user IS the company admin (User Role = COMPANY or
        // similar)
        // If the User table has a direct link or we look up Company by User ID
        Company company = companyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Company profile not found for this user"));

        Long companyId = company.getId();

        // 2. Count Signed Contracts (using ContractRecordRepository)
        // Adjust the repository method name if needed based on what exists
        // typically: countByCompanyId, or fetch list and size()
        long totalContracts = contractRepository.findByCompanyIdOrderBySignedAtDesc(companyId).size();

        // 3. Count Active Requests (Waiting for Company Action)
        // We look for submissions sent to this company that are WAITING_FOR_COMPANY
        long activeRequests = submissionRepository
                .findBySoftwareCompany_Id(companyId)
                .stream()
                .filter(s -> s.getStatus() == SubmissionStatus.WAITING_FOR_COMPANY)
                .count();

        // 4. Count Project Managers
        long totalPMs = projectManagerRepository.countByCompanyId(companyId);

        return CompanyDashboardDTO.builder()
                .totalContracts(totalContracts)
                .activeRequests(activeRequests)
                .totalProjectManagers(totalPMs)
                .build();
    }
}
