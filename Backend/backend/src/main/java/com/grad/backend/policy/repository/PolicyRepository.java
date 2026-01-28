package com.grad.backend.policy.repository;

import com.grad.backend.policy.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Policy> findByCompanyIdAndCategoryIgnoreCase(Long companyId, String category);
}
