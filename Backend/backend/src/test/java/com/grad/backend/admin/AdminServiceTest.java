package com.grad.backend.admin;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.grad.backend.Auth.entity.*;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.*;
import com.grad.backend.admin.dto.CreateAdminRequest;
import com.grad.backend.admin.service.AdminService;
import com.grad.backend.project.repository.ProjectProposalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyEmployeeRepository companyEmployeeRepository;

    @Mock
    private ClientPersonRepository clientPersonRepository;

    @Mock
    private ClientCompanyRepository clientCompanyRepository;

    @Mock
    private ProjectProposalRepository projectProposalRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@test.com");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("Test");
        adminUser.setRole(UserRole.ADMIN);
    }

    @Test
    void getAllAdmins_Success() {
        List<User> admins = Arrays.asList(adminUser);
        when(userRepository.findByRole(UserRole.ADMIN)).thenReturn(admins);

        List<User> result = adminService.getAllAdmins();

        assertEquals(1, result.size());
        assertEquals("admin@test.com", result.get(0).getEmail());
        verify(userRepository).findByRole(UserRole.ADMIN);
    }

    @Test
    void getAllAdmins_Empty() {
        when(userRepository.findByRole(UserRole.ADMIN)).thenReturn(Collections.emptyList());

        List<User> result = adminService.getAllAdmins();

        assertTrue(result.isEmpty());
    }

    @Test
    void createAdmin_Success() {
        CreateAdminRequest request = new CreateAdminRequest();
        request.setEmail("new@test.com");
        request.setPassword("pass123");
        request.setFirstName("New");
        request.setLastName("Admin");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPass");
        User savedUser = new User();
        savedUser.setId(3L);
        savedUser.setEmail("new@test.com");
        savedUser.setFirstName("New");
        savedUser.setLastName("Admin");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = adminService.createAdmin(request);

        assertNotNull(result);
        assertEquals("new@test.com", result.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createAdmin_DuplicateEmail_Throws() {
        CreateAdminRequest request = new CreateAdminRequest();
        request.setEmail("exists@test.com");
        request.setPassword("pass123");

        when(userRepository.existsByEmail("exists@test.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> adminService.createAdmin(request));

        assertEquals("User with this email already exists.", exception.getMessage());
    }

    @Test
    void deleteAdmin_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        adminService.deleteAdmin(1L);

        verify(userRepository).delete(adminUser);
    }

    @Test
    void deleteAdmin_NotFound_Throws() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> adminService.deleteAdmin(999L));

        assertTrue(exception.getMessage().contains("Admin not found"));
    }

    @Test
    void deleteAdmin_NonAdmin_Throws() {
        User nonAdmin = new User();
        nonAdmin.setId(2L);
        nonAdmin.setRole(UserRole.CLIENT_PERSON);
        when(userRepository.findById(2L)).thenReturn(Optional.of(nonAdmin));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> adminService.deleteAdmin(2L));

        assertEquals("User is not an admin.", exception.getMessage());
    }

    @Test
    void getAllCompanies_Success() {
        Company company = new Company();
        company.setId(1L);
        List<Company> companies = Arrays.asList(company);
        when(companyRepository.findAll()).thenReturn(companies);

        List<Company> result = adminService.getAllCompanies();

        assertEquals(1, result.size());
    }

    @Test
    void getAllEmployees_Success() {
        CompanyEmployee emp = new CompanyEmployee();
        emp.setId(1L);
        List<CompanyEmployee> emps = Arrays.asList(emp);
        when(companyEmployeeRepository.findAll()).thenReturn(emps);

        List<CompanyEmployee> result = adminService.getAllEmployees();

        assertEquals(1, result.size());
    }

    @Test
    void getAllClientPersons_Success() {
        ClientPerson client = new ClientPerson();
        client.setId(1L);
        List<ClientPerson> clients = Arrays.asList(client);
        when(clientPersonRepository.findAll()).thenReturn(clients);

        List<ClientPerson> result = adminService.getAllClientPersons();

        assertEquals(1, result.size());
    }

    @Test
    void getAllClientCompanies_Success() {
        ClientCompany cco = new ClientCompany();
        cco.setId(1L);
        List<ClientCompany> ccos = Arrays.asList(cco);
        when(clientCompanyRepository.findAll()).thenReturn(ccos);

        List<ClientCompany> result = adminService.getAllClientCompanies();

        assertEquals(1, result.size());
    }

 

    // Empty repo cases
    @Test
    void getAllCompanies_Empty() {
        when(companyRepository.findAll()).thenReturn(Collections.emptyList());
        assertTrue(adminService.getAllCompanies().isEmpty());
    }
}
