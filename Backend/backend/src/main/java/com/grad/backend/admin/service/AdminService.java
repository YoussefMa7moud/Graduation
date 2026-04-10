package com.grad.backend.admin.service;

import com.grad.backend.Auth.entity.*;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.*;
import com.grad.backend.admin.dto.CreateAdminRequest;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.repository.ProjectProposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyEmployeeRepository companyEmployeeRepository;
    private final ClientPersonRepository clientPersonRepository;
    private final ClientCompanyRepository clientCompanyRepository;
    private final ProjectProposalRepository projectProposalRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllAdmins() {
        return userRepository.findByRole(UserRole.ADMIN);
    }

    public User createAdmin(CreateAdminRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists.");
        }
        User newAdmin = new User();
        newAdmin.setEmail(req.getEmail());
        newAdmin.setPassword(passwordEncoder.encode(req.getPassword()));
        newAdmin.setFirstName(req.getFirstName());
        newAdmin.setLastName(req.getLastName());
        newAdmin.setRole(UserRole.ADMIN);
        
        return userRepository.save(newAdmin);
    }

    public void deleteAdmin(Long id) {
        User admin = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Admin not found with id: " + id));
            
        if (!admin.getRole().equals(UserRole.ADMIN)) {
            throw new IllegalArgumentException("User is not an admin.");
        }
        
        userRepository.delete(admin);
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public List<CompanyEmployee> getAllEmployees() {
        return companyEmployeeRepository.findAll();
    }

    public List<ClientPerson> getAllClientPersons() {
        return clientPersonRepository.findAll();
    }

    public List<ClientCompany> getAllClientCompanies() {
        return clientCompanyRepository.findAll();
    }

    public List<ProjectProposal> getAllProjects() {
        return projectProposalRepository.findAll();
    }
}
