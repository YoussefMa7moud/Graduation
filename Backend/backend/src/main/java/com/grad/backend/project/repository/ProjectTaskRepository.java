package com.grad.backend.project.repository;

import com.grad.backend.project.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {

    List<ProjectTask> findByCompanyProjectIdOrderByPhaseAscSortOrderAscIdAsc(Long companyProjectId);

    void deleteByCompanyProjectId(Long companyProjectId);

    long countByCompanyProjectId(Long companyProjectId);

    long countByCompanyProjectIdAndStatus(Long companyProjectId, com.grad.backend.project.enums.TaskStatus status);
}
