package com.grad.backend.user.repository;

import com.grad.backend.user.entity.ClientCompany;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ClientCompanyRepository extends JpaRepository<ClientCompany, Long> {
}
