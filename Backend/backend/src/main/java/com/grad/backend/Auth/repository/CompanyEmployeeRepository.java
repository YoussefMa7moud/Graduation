package com.grad.backend.Auth.repository;

import com.grad.backend.Auth.entity.CompanyEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyEmployeeRepository extends JpaRepository<CompanyEmployee, Long> {
    List<CompanyEmployee> findByCompanyId(Long companyId);
    Optional<CompanyEmployee> findByUserId(Long userId);
}
