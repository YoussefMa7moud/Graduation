package com.grad.backend.Auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grad.backend.Auth.entity.Client;


public interface ClientRepository extends JpaRepository<Client, Long> {
}
