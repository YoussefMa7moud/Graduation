package com.grad.backend.Auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grad.backend.Auth.entity.Company;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUser_Id(Long userId);
}
