package com.grad.backend.Auth.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grad.backend.Auth.entity.ClientCompany;

public interface ClientCompanyRepository extends JpaRepository<ClientCompany, UUID> {
}
