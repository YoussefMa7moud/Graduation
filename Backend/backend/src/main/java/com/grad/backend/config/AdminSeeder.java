package com.grad.backend.config;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:superadmin@grad.com}")
    private String adminEmail;

    @Value("${app.admin.password:superadminSECURE}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByRole(UserRole.ADMIN)) {
            log.info("No Admin found in the database. Seeding initial Admin from environment variables...");
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setRole(UserRole.ADMIN);
            
            userRepository.save(admin);
            log.info("Initial Admin created successfully with email: {}", adminEmail);
        } else {
            log.info("Admin user already exists. Skipping seeding.");
        }
    }
}
