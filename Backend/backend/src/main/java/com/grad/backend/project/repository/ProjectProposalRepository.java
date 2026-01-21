package com.grad.backend.project.repository;

import com.grad.backend.project.entity.ProjectProposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectProposalRepository extends JpaRepository<ProjectProposal, Long> {

    List<ProjectProposal> findByClientId(Long clientId);
}
