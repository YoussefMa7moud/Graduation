package com.grad.backend.company;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.grad.backend.Auth.controller.CompanyProfileController;
import com.grad.backend.Auth.dto.CompanyProfileDto;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.CompanyRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.Optional;

class CompanyProfileTest {

    private MockMvc mockMvc;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private CompanyProfileController controller;

    private Company company;
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

     mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();

        user = new User();
        user.setId(1L);
        user.setRole(UserRole.COMPANY_EMPLOYEE);

        company = new Company();
        company.setName("Old Name");
        company.setDescription("desc");
        company.setNationalId("123");
        company.setTitle("title");
        company.setCompanyRegNo("REG1");
        company.setPhoneNumber("0100000000");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user,
                null,
                Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void TC09_verifyUpdateCompanyName() throws Exception {

     authenticateAs(user);

        CompanyProfileDto dto = new CompanyProfileDto();
        dto.setName("New Name");
        dto.setDescription("desc");
        dto.setNationalId("123");
        dto.setTitle("title");
        dto.setCompanyRegNo("REG1");
        dto.setPhoneNumber("0100000000");

        when(companyRepository.findByUser_Id(1L))
                .thenReturn(Optional.of(company));

        // COMPANY_EMPLOYEE is blocked → expect 403
        mockMvc.perform(put("/api/company/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }
}