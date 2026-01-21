package com.grad.backend.Auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.grad.backend.Auth.dto.RegisterResponse;
import com.grad.backend.Auth.entity.*;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.*;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final ClientPersonRepository personRepo;
    private final ClientCompanyRepository clientCompanyRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public RegisterResponse register(
            String email,
            String password,
            String role,
            String clientType,
            String firstName,
            String lastName,
            String companyName,
            String description,
            MultipartFile logoFile
    ) {

        // ===== Basic validation =====
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required");
        }

        // IMPORTANT: firstName and lastName must always be provided
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }

        if (lastName == null || lastName.trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }

        if (userRepo.existsByEmail(email.trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already exists");
        }

        byte[] logoData = null;
        try {
            if (logoFile != null && !logoFile.isEmpty()) {
                logoData = logoFile.getBytes();
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read logo file");
        }

        // ===== Create User (ROOT ENTITY) =====
        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);

        // ===== SOFTWARE COMPANY =====
        if ("company".equalsIgnoreCase(role)) {

            if (companyName == null || companyName.trim().isEmpty()) {
                throw new IllegalArgumentException("Company name is required");
            }

            if (logoData == null) {
                throw new IllegalArgumentException("Logo file is required for company");
            }

            user.setRole(UserRole.SOFTWARE_COMPANY);
            user = userRepo.save(user);

            Company company = new Company();
            company.setUser(user);
            company.setName(companyName);
            company.setDescription(description);
            company.setLogo(logoData);

            companyRepo.save(company);
        }

        // ===== CLIENT =====
        else if ("client".equalsIgnoreCase(role)) {

            if (clientType == null || clientType.trim().isEmpty()) {
                throw new IllegalArgumentException("Client type is required");
            }

            // ---- Individual Client ----
            if ("individual".equalsIgnoreCase(clientType)) {

                user.setRole(UserRole.CLIENT_PERSON);
                user = userRepo.save(user);

                ClientPerson person = new ClientPerson();
                person.setUser(user);
                person.setFirstName(firstName);
                person.setLastName(lastName);

                personRepo.save(person);
            }

            // ---- Corporate Client ----
            else if ("corporate".equalsIgnoreCase(clientType)) {

                if (companyName == null || companyName.trim().isEmpty()) {
                    throw new IllegalArgumentException("Company name is required");
                }

                if (logoData == null) {
                    throw new IllegalArgumentException("Logo file is required for corporate client");
                }

                user.setRole(UserRole.CLIENT_COMPANY);
                user = userRepo.save(user);

                ClientCompany company = new ClientCompany();
                company.setUser(user);
                company.setCompanyName(companyName);
                company.setDescription(description);
                company.setLogo(logoData);

                clientCompanyRepo.save(company);
            }

            else {
                throw new IllegalArgumentException("Invalid client type");
            }
        }

        else {
            throw new IllegalArgumentException("Invalid role");
        }

        return new RegisterResponse(user.getId(), user.getRole().name());
    }
}
