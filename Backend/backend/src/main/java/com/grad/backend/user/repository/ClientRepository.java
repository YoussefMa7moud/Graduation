package com.grad.backend.user.repository;

import com.grad.backend.user.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ClientRepository extends JpaRepository<Client, Long> {
}
