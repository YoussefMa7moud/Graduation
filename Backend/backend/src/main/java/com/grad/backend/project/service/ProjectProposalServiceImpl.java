package com.grad.backend.project.service;

import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.DTO.ProjectProposalRequest;
import com.grad.backend.project.repository.ProjectProposalRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectProposalServiceImpl implements ProjectProposalService {

    private final ProjectProposalRepository proposalRepository;

    @Override
    @Transactional
    public ProjectProposal createProposal(ProjectProposalRequest request, Long authenticatedClientId) {

        ProjectProposal proposal = ProjectProposal.builder()
                .clientId(authenticatedClientId)
                .projectTitle(request.getProjectTitle())
                .projectType(request.getProjectType())
                .problemSolved(request.getProblemSolved())
                .description(request.getDescription())
                .mainFeatures(request.getMainFeatures())
                .userRoles(request.getUserRoles())
                .scalability(request.getScalability() != null ? request.getScalability() : "Small")
                .durationDays(request.getDurationDays())
                .budgetUsd(request.getBudgetUsd())
                .ndaRequired(Boolean.TRUE.equals(request.getNdaRequired()))
                .codeOwnership(request.getCodeOwnership())
                .maintenancePeriod(request.getMaintenancePeriod())
                .status("Pending")
                .build();

        return proposalRepository.save(proposal);
    }

    @Override
    public List<ProjectProposal> getProposalsByClientId(Long clientId) {
        return proposalRepository.findByClientId(clientId);
    }

    @Override
    @Transactional
    public void deleteProposal(Long proposalId, Long authenticatedClientId) {

        ProjectProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        // 🔐 Ownership check (VERY IMPORTANT)
        if (!proposal.getClientId().equals(authenticatedClientId)) {
            throw new RuntimeException("You are not allowed to delete this proposal");
        }

        proposalRepository.delete(proposal);
    }

    @Override
    public ProjectProposal getProposalById(Long proposalId, Long authenticatedClientId) {
 ProjectProposal proposal = proposalRepository.findById(proposalId)
 .orElseThrow(() -> new RuntimeException("Proposal not found"));

        // 🔐 Ownership check
        if (!proposal.getClientId().equals(authenticatedClientId)) {
 throw new RuntimeException("You are not allowed to view this proposal");
        }
 return proposal;
    }


    
    @Override
    public ProjectProposal updateProposal(Long proposalId, ProjectProposalRequest request, Long authenticatedClientId) {
 ProjectProposal proposal = proposalRepository.findById(proposalId)
 .orElseThrow(() -> new RuntimeException("Proposal not found"));

        // 🔐 Ownership check
        if (!proposal.getClientId().equals(authenticatedClientId)) {
 throw new RuntimeException("You are not allowed to update this proposal");
        }

        // Update fields
 proposal.setProjectTitle(request.getProjectTitle());
 proposal.setProjectType(request.getProjectType());
 proposal.setProblemSolved(request.getProblemSolved());
 proposal.setDescription(request.getDescription());
 proposal.setMainFeatures(request.getMainFeatures());
 proposal.setUserRoles(request.getUserRoles());
 proposal.setScalability(request.getScalability() != null ? request.getScalability() : "Small");
 proposal.setDurationDays(request.getDurationDays());
 proposal.setBudgetUsd(request.getBudgetUsd());
 proposal.setNdaRequired(Boolean.TRUE.equals(request.getNdaRequired()));
 proposal.setCodeOwnership(request.getCodeOwnership());
 proposal.setMaintenancePeriod(request.getMaintenancePeriod());
        // Status should probably not be updated by the client directly

 return proposalRepository.save(proposal);
    }
}
