package com.grad.backend.Auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grad.backend.Auth.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
