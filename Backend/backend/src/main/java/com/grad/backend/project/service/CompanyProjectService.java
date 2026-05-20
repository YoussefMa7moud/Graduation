package com.grad.backend.project.service;

import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.ProjectManager;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import com.grad.backend.Auth.repository.ProjectManagerRepository;
import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.project.DTO.AssignProjectRequest;
import com.grad.backend.project.DTO.CompanyProjectDTO;
import com.grad.backend.project.DTO.SaveTechnicalDocumentRequest;
import com.grad.backend.project.entity.CompanyProject;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.DTO.GenerateGuidelinesResponse;
import com.grad.backend.project.DTO.ai.AiGuidelinesResponseDTO;
import com.grad.backend.project.repository.CompanyProjectRepository;
import com.grad.backend.project.repository.ProjectProposalRepository;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyProjectService {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final CompanyProjectRepository companyProjectRepository;
    private final ContractRecordRepository contractRecordRepository;
    private final ProjectManagerRepository projectManagerRepository;
    private final CompanyRepository companyRepository;
    private final CompanyEmployeeRepository companyEmployeeRepository;
    private final ProjectProposalRepository projectProposalRepository;
    private final ProposalSubmissionRepository submissionRepository;
    private final ProjectGuidelinesAiService projectGuidelinesAiService;

    @Transactional
    public CompanyProjectDTO assignProject(AssignProjectRequest request, Long companyUserId) {
        Company company = companyRepository.findByUser_Id(companyUserId)
                .orElseGet(() -> companyEmployeeRepository.findByUserId(companyUserId)
                    .map(emp -> emp.getCompany())
                    .orElseThrow(() -> new RuntimeException("Company not found for user")));

        if (companyProjectRepository.existsByContractRecordId(request.getContractRecordId())) {
            throw new RuntimeException("This contract is already assigned to a project manager.");
        }

        ContractRecord record = contractRecordRepository.findById(request.getContractRecordId())
                .orElseThrow(() -> new RuntimeException("Contract Record not found"));

        if (!"MAIN_CONTRACT".equals(record.getContractType())) {
            throw new RuntimeException("Can only assign project managers to a main contract.");
        }

        if (!record.getCompanyId().equals(company.getId())) {
            throw new RuntimeException("Unauthorized: Contract does not belong to this company");
        }

        ProjectManager pm = projectManagerRepository.findById(request.getProjectManagerId())
                .orElseThrow(() -> new RuntimeException("Project Manager not found"));

        if (!pm.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("Unauthorized: Project Manager does not belong to this company");
        }

        CompanyProject project = CompanyProject.builder()
                .contractRecord(record)
                .projectManager(pm)
                .companyId(company.getId())
                .oclRules(request.getOclRules())
                .guidelines(request.getGuidelines())
                .status("ASSIGNED")
                .build();

        CompanyProject saved = companyProjectRepository.save(project);
        return mapToDTO(saved);
    }

    public List<CompanyProjectDTO> getCompanyProjects(Long companyUserId) {
        Company company = companyRepository.findByUser_Id(companyUserId)
                .orElseGet(() -> companyEmployeeRepository.findByUserId(companyUserId)
                    .map(emp -> emp.getCompany())
                    .orElseThrow(() -> new RuntimeException("Company not found for user")));

        return companyProjectRepository.findByCompanyId(company.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CompanyProjectDTO> getPMProjects(Long pmUserId) {
        return companyProjectRepository.findByProjectManagerId(pmUserId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyProjectDTO getProjectById(Long projectId, Long pmUserId) {
        CompanyProject project = companyProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getProjectManager().getId().equals(pmUserId)) {
            throw new RuntimeException("Unauthorized");
        }
        return mapToDTO(project);
    }

    @Transactional
    public void saveTechnicalDocumentJson(Long projectId, Long pmUserId, SaveTechnicalDocumentRequest request) {
        if (request == null || request.getDocumentFieldsJson() == null || request.getDocumentFieldsJson().isBlank()) {
            throw new RuntimeException("documentFieldsJson is required");
        }
        String normalized = normalizeDocumentFieldsJson(request.getDocumentFieldsJson());
        CompanyProject project = companyProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getProjectManager().getId().equals(pmUserId)) {
            throw new RuntimeException("Unauthorized");
        }
        project.setTechnicalDocumentJson(normalized);
        companyProjectRepository.save(project);
    }

    /**
     * Ensures payload is a JSON object with string values (editor field id → HTML).
     */
    public static String normalizeDocumentFieldsJson(String raw) {
        try {
            JsonNode root = JSON.readTree(raw);
            if (!root.isObject()) {
                throw new RuntimeException("documentFieldsJson must be a JSON object");
            }
            return JSON.writeValueAsString(root);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Invalid documentFieldsJson: " + e.getMessage());
        }
    }

    @Transactional
    public GenerateGuidelinesResponse generateGuidelinesAndSummary(Long projectId, Long pmUserId) {
        CompanyProject project = companyProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getProjectManager().getId().equals(pmUserId)) {
            throw new RuntimeException("Unauthorized: you are not assigned to this project");
        }

        CompanyProjectDTO dto = mapToDTO(project);
        AiGuidelinesResponseDTO ai = projectGuidelinesAiService.generate(dto);

        project.setProjectSummary(ai.getProjectSummary().trim());
        companyProjectRepository.save(project);

        return GenerateGuidelinesResponse.builder()
                .message("Project summary generated successfully")
                .projectSummary(project.getProjectSummary())
                .guidelines(project.getGuidelines())
                .build();
    }

    private CompanyProjectDTO mapToDTO(CompanyProject entity) {
        String pmName = entity.getProjectManager().getUser().getFirstName() + " " +
                        entity.getProjectManager().getUser().getLastName();

        Long submissionId = entity.getContractRecord().getSubmissionId();

        // Check if NDA exists for this submission
        boolean ndaSigned = contractRecordRepository.findBySubmissionId(submissionId)
            .stream()
            .anyMatch(r -> "NDA".equals(r.getContractType()));

        // Fetch the full ProposalSubmission to get proposal + client details
        ProposalSubmission submission = submissionRepository.findById(submissionId).orElse(null);
        ProjectProposal proposal = submission != null ? submission.getProposal() : null;

        String clientName = null;
        if (submission != null && submission.getClient() != null) {
            clientName = submission.getClient().getFirstName() + " " + submission.getClient().getLastName();
        }

        return CompanyProjectDTO.builder()
                .id(entity.getId())
                .contractRecordId(entity.getContractRecord().getId())
                .contractName(entity.getContractRecord().getFileName())
                .projectManagerId(entity.getProjectManager().getId())
                .projectManagerName(pmName)
                .ndaSigned(ndaSigned)
                .proposalId(submissionId)
                .projectTitle(proposal != null ? proposal.getProjectTitle() : "Unknown Project")
                .projectDescription(proposal != null ? proposal.getDescription() : null)
                .projectType(proposal != null ? proposal.getProjectType() : null)
                .mainFeatures(proposal != null ? proposal.getMainFeatures() : null)
                .budgetUsd(proposal != null ? proposal.getBudgetUsd() : null)
                .durationDays(proposal != null ? proposal.getDurationDays() : null)
                .clientName(clientName)
                .oclRules(entity.getOclRules())
                .guidelines(entity.getGuidelines())
                .projectSummary(entity.getProjectSummary())
                .technicalDocumentJson(entity.getTechnicalDocumentJson())
                .technicalDocumentValidationJson(entity.getTechnicalDocumentValidationJson())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
