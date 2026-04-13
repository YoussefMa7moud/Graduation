package com.grad.backend.company.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.grad.backend.company.entity.SoftwareCompany;
import com.grad.backend.company.repository.SoftwareCompanyRepository;

class CompanyControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SoftwareCompanyRepository repository;

    @InjectMocks
    private CompanyController controller;

    private SoftwareCompany company1;
    private SoftwareCompany company2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        company1 = new SoftwareCompany();
        company1.setId(1L);
        company1.setName("Company A");

        company2 = new SoftwareCompany();
        company2.setId(2L);
        company2.setName("Company B");
    }

    @Test
    void testGetAllCompanies() throws Exception {
        List<SoftwareCompany> companies = Arrays.asList(company1, company2);

        when(repository.findAll()).thenReturn(companies);

        mockMvc.perform(get("/api/companies/browse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Company A"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Company B"));
    }
}
