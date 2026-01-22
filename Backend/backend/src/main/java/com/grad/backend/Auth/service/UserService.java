package com.grad.backend.Auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.grad.backend.Auth.dto.PasswordUpdateRequest;
import com.grad.backend.Auth.dto.ProfileUpdateRequest;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User updateProfile(User user, ProfileUpdateRequest request) {
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        return userRepository.save(user);
    }

    @Transactional
    public void updatePassword(User user, PasswordUpdateRequest request) {
        // 1. Verify the current password matches the database
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Old password does not match!");
        }
        
        // 2. Encrypt and save the new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}