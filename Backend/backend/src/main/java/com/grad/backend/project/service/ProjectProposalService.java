package com.grad.backend.project.service;

import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.DTO.ProjectProposalRequest;

public interface ProjectProposalService {
    // Updated to accept Long clientId
    ProjectProposal createProposal(ProjectProposalRequest request, Long authenticatedClientId);
    ProjectProposal getProposalById(Long id);
}