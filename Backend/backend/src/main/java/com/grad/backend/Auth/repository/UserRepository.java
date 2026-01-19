package com.grad.backend.Auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grad.backend.Auth.entity.User;

import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
