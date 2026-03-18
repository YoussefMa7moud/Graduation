package com.grad.backend.Auth.service;

import com.grad.backend.Auth.dto.CompanyDashboardDTO;
import com.grad.backend.Auth.dto.MonthlyStatDTO;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.Auth.repository.ProjectManagerRepository;
import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.enums.SubmissionStatus;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CompanyRepository companyRepository;
    private final ContractRecordRepository contractRepository;
    private final ProposalSubmissionRepository submissionRepository;
    private final ProjectManagerRepository projectManagerRepository;

    public CompanyDashboardDTO getCompanyStats(Long userId) {
        Company company = companyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Company profile not found for this user"));

        Long companyId = company.getId();

        List<ContractRecord> allContracts = contractRepository.findByCompanyIdOrderBySignedAtDesc(companyId);
        long totalContracts = allContracts.size();

        List<ProposalSubmission> allSubmissions = submissionRepository.findBySoftwareCompany_Id(companyId);
        
        long activeRequests = allSubmissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.WAITING_FOR_COMPANY)
                .count();

        long totalPMs = projectManagerRepository.countByCompanyId(companyId);

        // Generate 6 months chart dataset
        List<MonthlyStatDTO> graphData = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime targetMonth = now.minusMonths(i);
            Month month = targetMonth.getMonth();
            int year = targetMonth.getYear();
            
            String monthName = month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            int contractsThisMonth = (int) allContracts.stream()
                    .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().getMonth() == month && c.getCreatedAt().getYear() == year)
                    .count();
                    
            int requestsThisMonth = (int) allSubmissions.stream()
                    .filter(s -> s.getProposedAt() != null && s.getProposedAt().getMonth() == month && s.getProposedAt().getYear() == year)
                    .count();

            graphData.add(new MonthlyStatDTO(monthName, contractsThisMonth, requestsThisMonth));
        }

        return CompanyDashboardDTO.builder()
                .totalContracts(totalContracts)
                .activeRequests(activeRequests)
                .totalProjectManagers(totalPMs)
                .graphData(graphData)
                .build();
    }
}
