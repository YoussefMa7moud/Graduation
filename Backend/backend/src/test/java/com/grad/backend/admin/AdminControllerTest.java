package com.grad.backend.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.CompanyEmployee;
import com.grad.backend.Auth.entity.ClientPerson;
import com.grad.backend.Auth.entity.ClientCompany;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.admin.controller.AdminController;
import com.grad.backend.admin.dto.AdminResponseDto;
import com.grad.backend.admin.dto.CreateAdminRequest;
import com.grad.backend.admin.service.AdminService;
import com.grad.backend.project.entity.ProjectProposal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

class AdminControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AdminService adminService;

    @InjectMocks
    private AdminController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    // ADMIN MANAGEMENT TESTS

    @Test
    void getAllAdmins_Success() throws Exception {
        User admin1 = new User();
        admin1.setId(1L);
        admin1.setEmail("admin1@test.com");
        admin1.setFirstName("Admin");
        admin1.setLastName("One");
        User admin2 = new User();
        admin2.setId(2L);
        admin2.setEmail("admin2@test.com");
        admin2.setFirstName("Admin");
        admin2.setLastName("Two");

        when(adminService.getAllAdmins()).thenReturn(Arrays.asList(admin1, admin2));

        mockMvc.perform(get("/api/admin/admins"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].email").value("admin1@test.com"))
                .andExpect(jsonPath("$[1].id").value(2L));

        verify(adminService).getAllAdmins();
    }

    @Test
    void getAllAdmins_Empty() throws Exception {
        when(adminService.getAllAdmins()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/admins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createAdmin_Success() throws Exception {
        CreateAdminRequest request = new CreateAdminRequest();
        request.setEmail("newadmin@test.com");
        request.setPassword("password123");
        request.setFirstName("New");
        request.setLastName("Admin");

        User newAdmin = new User();
        newAdmin.setId(3L);
        newAdmin.setEmail("newadmin@test.com");
        newAdmin.setFirstName("New");
        newAdmin.setLastName("Admin");

        when(adminService.createAdmin(any(CreateAdminRequest.class))).thenReturn(newAdmin);

        mockMvc.perform(post("/api/admin/admins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3L))
                .andExpect(jsonPath("$.email").value("newadmin@test.com"));

        verify(adminService).createAdmin(any());
    }

@Test
void createAdmin_DuplicateEmail() throws Exception {
    CreateAdminRequest request = new CreateAdminRequest();
    request.setEmail("exists@test.com");
    request.setPassword("password123");
    request.setFirstName("Dup");
    request.setLastName("Admin");

    when(adminService.createAdmin(any()))
            .thenThrow(new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "User with this email already exists."));

    mockMvc.perform(post("/api/admin/admins")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
}

@Test
void deleteAdmin_NotFound() throws Exception {
    doThrow(new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Admin not found with id: 999"))
            .when(adminService).deleteAdmin(999L);

    mockMvc.perform(delete("/api/admin/admins/{id}", 999L))
            .andExpect(status().isBadRequest());
}

@Test
void deleteAdmin_NonAdmin() throws Exception {
    doThrow(new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "User is not an admin."))
            .when(adminService).deleteAdmin(1L);

    mockMvc.perform(delete("/api/admin/admins/{id}", 1L))
            .andExpect(status().isBadRequest());
}
    @Test
    void deleteAdmin_Success() throws Exception {
        mockMvc.perform(delete("/api/admin/admins/{id}", 1L))
                .andExpect(status().isNoContent());

        verify(adminService).deleteAdmin(1L);
    }

   

    @Test
    void getAllCompanies_Success() throws Exception {
        Company company = new Company();
        company.setId(1L);
        company.setName("Test Corp");
        when(adminService.getAllCompanies()).thenReturn(Arrays.asList(company));

        mockMvc.perform(get("/api/admin/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void getAllEmployees_Success() throws Exception {
        CompanyEmployee emp = new CompanyEmployee();
        emp.setId(1L);
        when(adminService.getAllEmployees()).thenReturn(Arrays.asList(emp));

        mockMvc.perform(get("/api/admin/employees"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllClientPersons_Success() throws Exception {
        ClientPerson client = new ClientPerson();
        client.setId(1L);
        when(adminService.getAllClientPersons()).thenReturn(Arrays.asList(client));

        mockMvc.perform(get("/api/admin/clients/persons"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllClientCompanies_Success() throws Exception {
        ClientCompany cclient = new ClientCompany();
        cclient.setId(1L);
        when(adminService.getAllClientCompanies()).thenReturn(Arrays.asList(cclient));

        mockMvc.perform(get("/api/admin/clients/companies"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllProjects_Success() throws Exception {
        ProjectProposal proj = new ProjectProposal();
        proj.setId(1L);
        when(adminService.getAllProjects()).thenReturn(Arrays.asList(proj));

        mockMvc.perform(get("/api/admin/projects"))
                .andExpect(status().isOk());
    }

    // Empty list cases (partial, extend for full coverage)
    @Test
    void getAllCompanies_Empty() throws Exception {
        when(adminService.getAllCompanies()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/admin/companies")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    // Note: @PreAuthorize not enforced in standalone MockMvc (needs full security context for 401 tests)
    // 401 covered by integration tests or full @SpringBootTest if needed
}

