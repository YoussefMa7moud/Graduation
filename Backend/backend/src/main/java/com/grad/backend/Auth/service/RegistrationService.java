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
    private final ProjectManagerRepository projectManagerRepo;
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
            MultipartFile logoFile,
            String nationalId,
            String title,
            String companyRegNo,
            String phoneNumber) {

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
                // Validate file size (max 1MB = 1,048,576 bytes)
                long maxSize = 1024 * 1024; // 1MB
                if (logoFile.getSize() > maxSize) {
                    throw new IllegalArgumentException(
                            "Logo file size must be less than 1MB. Please compress or resize your image.");
                }
                logoData = logoFile.getBytes();
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read logo file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            // Re-throw validation errors
            throw e;
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

            // Validate required fields for software company
            if (nationalId == null || nationalId.trim().isEmpty()) {
                throw new IllegalArgumentException("National ID is required for software company");
            }
            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Title is required for software company");
            }
            if (!title.equalsIgnoreCase("CEO") && !title.equalsIgnoreCase("CTO")
                    && !title.equalsIgnoreCase("Legal Rep")) {
                throw new IllegalArgumentException("Title must be one of: CEO, CTO, or Legal Rep");
            }
            if (companyRegNo == null || companyRegNo.trim().isEmpty()) {
                throw new IllegalArgumentException("Company Registration Number is required for software company");
            }
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                throw new IllegalArgumentException("Phone number is required");
            }

            Company company = new Company();
            company.setUser(user);
            company.setName(companyName);
            company.setDescription(description);
            company.setLogo(logoData);
            company.setNationalId(nationalId);
            company.setTitle(title);
            company.setCompanyRegNo(companyRegNo);
            company.setPhoneNumber(phoneNumber);

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

                // Validate required fields for individual client
                if (nationalId == null || nationalId.trim().isEmpty()) {
                    throw new IllegalArgumentException("National ID is required for individual client");
                }
                if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                    throw new IllegalArgumentException("Phone number is required");
                }

                ClientPerson person = new ClientPerson();
                person.setUser(user);
                person.setFirstName(firstName);
                person.setLastName(lastName);
                person.setNationalId(nationalId);
                person.setPhoneNumber(phoneNumber);

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

                // Validate required fields for corporate client
                if (nationalId == null || nationalId.trim().isEmpty()) {
                    throw new IllegalArgumentException("National ID is required for corporate client");
                }
                if (title == null || title.trim().isEmpty()) {
                    throw new IllegalArgumentException("Title is required for corporate client");
                }
                if (!title.equalsIgnoreCase("CEO") && !title.equalsIgnoreCase("CTO")
                        && !title.equalsIgnoreCase("Legal Rep")) {
                    throw new IllegalArgumentException("Title must be one of: CEO, CTO, or Legal Rep");
                }
                if (companyRegNo == null || companyRegNo.trim().isEmpty()) {
                    throw new IllegalArgumentException("Company Registration Number is required for corporate client");
                }
                if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                    throw new IllegalArgumentException("Phone number is required");
                }

                ClientCompany company = new ClientCompany();
                company.setUser(user);
                company.setCompanyName(companyName);
                company.setDescription(description);
                company.setLogo(logoData);
                company.setNationalId(nationalId);
                company.setTitle(title);
                company.setCompanyRegNo(companyRegNo);
                company.setPhoneNumber(phoneNumber);

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

    @Transactional
    public RegisterResponse registerProjectManager(
            Long companyUserId, // The ID of the logged-in company user
            String firstName,
            String lastName,
            String email,
            String password) {
        // 1. Validate
        if (email == null || email.trim().isEmpty())
            throw new IllegalArgumentException("Email is required");
        if (password == null || password.trim().isEmpty())
            throw new IllegalArgumentException("Password is required");
        if (firstName == null || firstName.trim().isEmpty())
            throw new IllegalArgumentException("First name is required");
        if (lastName == null || lastName.trim().isEmpty())
            throw new IllegalArgumentException("Last name is required");

        if (userRepo.existsByEmail(email.trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // 2. Get the Company (Parent)
        // Ensure the companyUserId refers to a User who is a SOFTWARE_COMPANY
        // Then get the Company entity associated with that User.
        Company company = companyRepo.findByUser_Id(companyUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Company profile not found for the provided user ID: " + companyUserId));

        // 3. Create User
        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(UserRole.PROJECT_MANAGER);

        user = userRepo.save(user);

        // 4. Create ProjectManager Entity
        ProjectManager pm = new ProjectManager();
        pm.setUser(user);
        pm.setCompany(company);

        projectManagerRepo.save(pm);

        return new RegisterResponse(user.getId(), user.getRole().name());
    }
}
