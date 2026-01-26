package com.grad.backend.Auth.service;

import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.ProjectManager;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.Auth.repository.ProjectManagerRepository;
import com.grad.backend.Auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectManagerService {

    private final ProjectManagerRepository projectManagerRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public List<ProjectManager> getProjectManagers(Long companyUserId) {
        Company company = companyRepository.findByUser_Id(companyUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // This assumes we can filter by company.
        // We need to add findByCompanyId to ProjectManagerRepository if not exists,
        // or filter locally but repo method is better.
        // Assuming we will add or it exists: List<ProjectManager> findByCompanyId(Long
        // id);
        return projectManagerRepository.findByCompanyId(company.getId());
    }

    @Transactional
    public void updateProjectManager(Long pmId, String firstName, String lastName, String email) {
        ProjectManager pm = projectManagerRepository.findById(pmId)
                .orElseThrow(() -> new RuntimeException("Project Manager not found"));

        User user = pm.getUser();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);

        userRepository.save(user);
    }

    @Transactional
    public void deleteProjectManager(Long pmId) {
        ProjectManager pm = projectManagerRepository.findById(pmId)
                .orElseThrow(() -> new RuntimeException("Project Manager not found"));

        // Delete the ProjectManager entity
        projectManagerRepository.delete(pm);

        // Also delete the associated User entity
        userRepository.delete(pm.getUser());
    }
}
