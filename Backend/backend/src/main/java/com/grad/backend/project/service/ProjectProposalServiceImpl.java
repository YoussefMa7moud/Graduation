package com.grad.backend.project.service;

import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.DTO.ProjectProposalRequest;
import com.grad.backend.project.repository.ProjectProposalRepository;
import com.grad.backend.project.service.ProjectProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectProposalServiceImpl implements ProjectProposalService {

    private final ProjectProposalRepository proposalRepository;

    @Override
    @Transactional
    public ProjectProposal createProposal(ProjectProposalRequest request, Long authenticatedClientId) {
        // Build the entity from the DTO
        ProjectProposal proposal = ProjectProposal.builder()
                .clientId(authenticatedClientId) // <--- THIS is the fix. Use the passed ID.
                .projectTitle(request.getProjectTitle())
                .projectType(request.getProjectType())
                .problemSolved(request.getProblemSolved())
                .description(request.getDescription())
                .mainFeatures(request.getMainFeatures())
                .userRoles(request.getUserRoles())
                .scalability(request.getScalability() != null ? request.getScalability() : "Small")
                .durationDays(request.getDurationDays())
                .budgetUsd(request.getBudgetUsd())
                .ndaRequired(request.getNdaRequired() != null && request.getNdaRequired())
                .codeOwnership(request.getCodeOwnership())
                .maintenancePeriod(request.getMaintenancePeriod())
                .status("Pending")
                .build();

        return proposalRepository.save(proposal);
    }

    @Override
    public ProjectProposal getProposalById(UUID id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found with id: " + id));
    }
}