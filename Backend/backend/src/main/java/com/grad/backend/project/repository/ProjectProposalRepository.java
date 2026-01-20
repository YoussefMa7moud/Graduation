package com.grad.backend.project.repository;

import com.grad.backend.project.entity.ProjectProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProjectProposalRepository extends JpaRepository<ProjectProposal, UUID> {
    // You can add custom queries here, like finding all proposals for a specific client
    java.util.List<ProjectProposal> findByClientId(Long clientId);
}