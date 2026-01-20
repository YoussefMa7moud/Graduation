package com.grad.backend.project.service;

import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.DTO.ProjectProposalRequest;
import java.util.UUID;

public interface ProjectProposalService {
    // Updated to accept Long clientId
    ProjectProposal createProposal(ProjectProposalRequest request, Long clientId);
    ProjectProposal getProposalById(UUID id);
}