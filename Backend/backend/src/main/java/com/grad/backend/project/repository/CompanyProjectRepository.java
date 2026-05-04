package com.grad.backend.project.repository;

import com.grad.backend.project.entity.CompanyProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyProjectRepository extends JpaRepository<CompanyProject, Long> {
    List<CompanyProject> findByCompanyId(Long companyId);
    List<CompanyProject> findByProjectManagerId(Long projectManagerId);
    boolean existsByProjectManagerId(Long projectManagerId);
    boolean existsByContractRecordId(Long contractRecordId);
    java.util.Optional<CompanyProject> findByContractRecordId(Long contractRecordId);
}
