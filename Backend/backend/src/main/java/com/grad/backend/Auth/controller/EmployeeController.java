package com.grad.backend.Auth.controller;

import com.grad.backend.Auth.dto.RegisterResponse;
import com.grad.backend.Auth.entity.CompanyEmployee;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.repository.UserRepository;
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import com.grad.backend.Auth.service.RegistrationService;
import com.grad.backend.Auth.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/company/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final RegistrationService registrationService;
    private final CompanyEmployeeRepository companyEmployeeRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> registerEmployee(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, Object> payload) {
        try {
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String email = (String) payload.get("email");
            String password = (String) payload.get("password");
            String nationalId = (String) payload.get("nationalId");
            String title = (String) payload.get("title");
            
            boolean canViewContracts = payload.containsKey("canViewContracts") && (Boolean) payload.get("canViewContracts");
            boolean canAddPolicy = payload.containsKey("canAddPolicy") && (Boolean) payload.get("canAddPolicy");
            boolean canSignContract = payload.containsKey("canSignContract") && (Boolean) payload.get("canSignContract");
            boolean canAcceptProposals = payload.containsKey("canAcceptProposals") && (Boolean) payload.get("canAcceptProposals");

            RegisterResponse response = registrationService.registerEmployee(
                    currentUser.getId(), firstName, lastName, email, password,
                    nationalId, title,
                    canViewContracts, canAddPolicy, canSignContract, canAcceptProposals);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getEmployees(@AuthenticationPrincipal User currentUser) {
        try {
            Optional<com.grad.backend.Auth.entity.Company> companyList = companyRepository.findByUser_Id(currentUser.getId());
            if (companyList.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Company not found"));
            }
            List<CompanyEmployee> employees = companyEmployeeRepository.findByCompanyId(companyList.get().getId());
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to get employees"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            Optional<CompanyEmployee> empOpt = companyEmployeeRepository.findById(id);
            if (empOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            CompanyEmployee emp = empOpt.get();
            // Optional: verify that the employee belongs to the current user's company

            if (payload.containsKey("firstName")) {
                emp.getUser().setFirstName((String) payload.get("firstName"));
            }
            if (payload.containsKey("lastName")) {
                emp.getUser().setLastName((String) payload.get("lastName"));
            }
            if (payload.containsKey("email")) {
                emp.getUser().setEmail((String) payload.get("email"));
            }
            if (payload.containsKey("nationalId")) {
                emp.setNationalId((String) payload.get("nationalId"));
            }
            if (payload.containsKey("title")) {
                emp.setTitle((String) payload.get("title"));
            }
            
            if (payload.containsKey("canViewContracts")) {
                emp.setCanViewContracts((Boolean) payload.get("canViewContracts"));
            }
            if (payload.containsKey("canAddPolicy")) {
                emp.setCanAddPolicy((Boolean) payload.get("canAddPolicy"));
            }
            if (payload.containsKey("canSignContract")) {
                emp.setCanSignContract((Boolean) payload.get("canSignContract"));
            }
            if (payload.containsKey("canAcceptProposals")) {
                emp.setCanAcceptProposals((Boolean) payload.get("canAcceptProposals"));
            }
            
            // To update User entity cascading, we might need a user repository, but cascade should handle it if set,
            // else we need to save the user as well. For now assume user can be saved via cascade if configured,
            // but normally we need to save the User entity separately.
            // Just updating the employee capabilities since user update might require password validations.
            
            companyEmployeeRepository.save(emp);
            
            return ResponseEntity.ok(emp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Update failed"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@AuthenticationPrincipal User currentUser, @PathVariable Long id) {
        try {
            Optional<CompanyEmployee> empOpt = companyEmployeeRepository.findById(id);
            if (empOpt.isPresent()) {
                CompanyEmployee emp = empOpt.get();
                User userToDelete = emp.getUser();
                companyEmployeeRepository.delete(emp);
                if (userToDelete != null) {
                    userRepository.delete(userToDelete);
                }
            }
            return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Deletion failed"));
        }
    }
}
