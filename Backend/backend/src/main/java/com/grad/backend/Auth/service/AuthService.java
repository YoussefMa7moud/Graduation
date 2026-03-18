package com.grad.backend.Auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.grad.backend.Auth.dto.LoginRequest;
import com.grad.backend.Auth.dto.LoginResponse;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.entity.ClientPerson;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.UserRepository;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.Auth.entity.CompanyEmployee;
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ClientPersonRepository clientPersonRepository;
    private final CompanyEmployeeRepository companyEmployeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        // For CLIENT_PERSON, get firstName and lastName from ClientPerson entity
        // For other roles, get from User entity
        String firstName = user.getFirstName();
        String lastName = user.getLastName();
        
        if (user.getRole() == UserRole.CLIENT_PERSON) {
            Optional<ClientPerson> clientPerson = clientPersonRepository.findById(user.getId());
            if (clientPerson.isPresent()) {
                firstName = clientPerson.get().getFirstName();
                lastName = clientPerson.get().getLastName();
            }
        }

        Boolean canViewContracts = null;
        Boolean canAddPolicy = null;
        Boolean canSignContract = null;
        Boolean canAcceptProposals = null;

        if (user.getRole() == UserRole.SOFTWARE_COMPANY) {
            canViewContracts = true;
            canAddPolicy = true;
            canSignContract = true;
            canAcceptProposals = true;
        } else if (user.getRole() == UserRole.COMPANY_EMPLOYEE) {
            Optional<CompanyEmployee> empOpt = companyEmployeeRepository.findByUserId(user.getId());
            if (empOpt.isPresent()) {
                CompanyEmployee emp = empOpt.get();
                canViewContracts = emp.isCanViewContracts();
                canAddPolicy = emp.isCanAddPolicy();
                canSignContract = emp.isCanSignContract();
                canAcceptProposals = emp.isCanAcceptProposals();
            }
        }

        return new LoginResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                firstName,
                lastName,
                canViewContracts,
                canAddPolicy,
                canSignContract,
                canAcceptProposals
        );
    }
}
