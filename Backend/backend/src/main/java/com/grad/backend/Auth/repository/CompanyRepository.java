package com.grad.backend.Auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grad.backend.Auth.entity.Company;


public interface CompanyRepository extends JpaRepository<Company, Long> {
}
