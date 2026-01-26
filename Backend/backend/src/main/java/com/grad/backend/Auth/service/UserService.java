package com.grad.backend.Auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.grad.backend.Auth.dto.PasswordUpdateRequest;
import com.grad.backend.Auth.dto.ProfileUpdateRequest;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.entity.ClientPerson;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.UserRepository;
import com.grad.backend.Auth.repository.ClientPersonRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ClientPersonRepository clientPersonRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User updateProfile(User user, ProfileUpdateRequest request) {
        // Update User entity
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        user = userRepository.save(user);

        // For CLIENT_PERSON, also update ClientPerson entity
        if (user.getRole() == UserRole.CLIENT_PERSON) {
            Optional<ClientPerson> clientPersonOpt = clientPersonRepository.findById(user.getId());
            if (clientPersonOpt.isPresent()) {
                ClientPerson clientPerson = clientPersonOpt.get();
                if (request.getFirstName() != null)
                    clientPerson.setFirstName(request.getFirstName());
                if (request.getLastName() != null)
                    clientPerson.setLastName(request.getLastName());
                clientPersonRepository.save(clientPerson);
            }
        }

        return user;
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