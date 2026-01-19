package com.grad.backend.company.repository;

import com.grad.backend.company.entity.SoftwareCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SoftwareCompanyRepository extends JpaRepository<SoftwareCompany, Integer> {
   
}