package com.grad.backend.user.service;

import com.grad.backend.user.dto.RegisterResponse;
import com.grad.backend.user.entity.*;
import com.grad.backend.user.enums.ClientType;
import com.grad.backend.user.enums.UserRole;
import com.grad.backend.user.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final ClientRepository clientRepo;
    private final ClientPersonRepository personRepo;
    private final ClientCompanyRepository clientCompanyRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public RegisterResponse register(
            String email, String password, String role, String clientType,
            String firstName, String lastName, String companyName, String description,
            MultipartFile logoFile
    ) {
        // Validate email uniqueness
        if (userRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Validate required fields
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required");
        }

        byte[] logoData = null;
        if (logoFile != null && !logoFile.isEmpty()) {
            try {
                logoData = logoFile.getBytes();
            } catch (IOException e) {
                throw new IllegalArgumentException("Failed to read logo file: " + e.getMessage());
            }
        }

        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);

        // SOFTWARE COMPANY
        if (role.equals("company")) {
            if (companyName == null || companyName.trim().isEmpty()) {
                throw new IllegalArgumentException("Company name is required for software company");
            }
            // Logo file is mandatory for companies
            if (logoFile == null || logoFile.isEmpty()) {
                throw new IllegalArgumentException("Logo file upload is required for software company. Please upload a photo file, not a URL.");
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
        // CLIENT
        else if (role.equals("client")) {
            if (clientType == null || clientType.trim().isEmpty()) {
                throw new IllegalArgumentException("Client type is required");
            }

            if (clientType.equals("individual")) {
                if (firstName == null || firstName.trim().isEmpty() ||
                    lastName == null || lastName.trim().isEmpty()) {
                    throw new IllegalArgumentException("First name and last name are required for individual client");
                }
                user.setRole(UserRole.CLIENT_PERSON);
            } else if (clientType.equals("corporate")) {
                if (companyName == null || companyName.trim().isEmpty()) {
                    throw new IllegalArgumentException("Company name is required for corporate client");
                }
                // Logo file is mandatory for corporate clients (companies)
                if (logoFile == null || logoFile.isEmpty()) {
                    throw new IllegalArgumentException("Logo file upload is required for corporate client. Please upload a photo file, not a URL.");
                }
                user.setRole(UserRole.CLIENT_COMPANY);
            } else {
                throw new IllegalArgumentException("Invalid client type. Must be 'individual' or 'corporate'");
            }

            user = userRepo.save(user);

            Client client = new Client();
            client.setUser(user);
            client.setClientType(
                clientType.equals("individual")
                    ? ClientType.PERSON
                    : ClientType.COMPANY
            );
            client = clientRepo.save(client);

            if (client.getClientType() == ClientType.PERSON) {
                ClientPerson p = new ClientPerson();
                p.setClient(client);
                p.setFirstName(firstName);
                p.setLastName(lastName);
                personRepo.save(p);
            } else {
                ClientCompany c = new ClientCompany();
                c.setClient(client);
                c.setCompanyName(companyName);
                c.setDescription(description);
                c.setLogo(logoData);
                clientCompanyRepo.save(c);
            }
        } else {
            throw new IllegalArgumentException("Invalid role. Must be 'client' or 'company'");
        }

        return new RegisterResponse(user.getId(), user.getRole().name());
    }
}
