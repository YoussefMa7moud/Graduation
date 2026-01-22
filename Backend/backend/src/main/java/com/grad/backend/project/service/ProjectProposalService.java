package com.grad.backend.project.service;

import com.grad.backend.project.entity.ProjectProposal;

import java.util.List;

import com.grad.backend.project.DTO.ProjectProposalRequest;

public interface ProjectProposalService {

    ProjectProposal createProposal(ProjectProposalRequest request, Long authenticatedClientId);

    List<ProjectProposal> getProposalsByClientId(Long clientId);

    ProjectProposal getProposalById(Long proposalId, Long authenticatedClientId);

    ProjectProposal updateProposal(Long proposalId, ProjectProposalRequest request, Long authenticatedClientId);

    void deleteProposal(Long proposalId, Long authenticatedClientId);
}
