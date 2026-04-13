package com.grad.backend.policy.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.policy.dto.PolicyConvertRequest;
import com.grad.backend.policy.dto.PolicyConvertResponse;
import com.grad.backend.policy.dto.PolicyResponse;
import com.grad.backend.policy.dto.PolicySaveRequest;
import com.grad.backend.policy.service.PolicyService;

class PolicyControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PolicyService policyService;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyEmployeeRepository companyEmployeeRepository;

    @InjectMocks
    private PolicyController policyController;

    private User testUser;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId(10L);
        testUser.setRole(UserRole.SOFTWARE_COMPANY);

        mockMvc = MockMvcBuilders.standaloneSetup(policyController)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                    }

                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return testUser;
                    }
                })
                .build();
    }

    @Test
    void testConvertPolicy_Success() throws Exception {
        PolicyConvertRequest request = new PolicyConvertRequest();
        request.setPolicyText("Text");
        request.setPolicyName("Name");

        PolicyConvertResponse response = new PolicyConvertResponse();
        response.setOclCode("Generated OCL");

        when(policyService.convertPolicy(any(PolicyConvertRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/policies/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.oclCode").value("Generated OCL"));
    }

    @Test
    void testSavePolicy_Success() throws Exception {
        PolicySaveRequest request = new PolicySaveRequest();
        request.setPolicyName("SaveMe");

        PolicyResponse response = new PolicyResponse();
        response.setId(1L);
        response.setPolicyName("SaveMe");

        Company company = new Company();
        company.setName("TestCompany");
        when(companyRepository.findById(10L)).thenReturn(Optional.of(company));
        
        when(policyService.savePolicy(any(PolicySaveRequest.class), eq(10L), eq("TestCompany"))).thenReturn(response);

        mockMvc.perform(post("/api/policies/save")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.policyName").value("SaveMe"));
    }

    @Test
    void testGetPolicies_Success() throws Exception {
        PolicyResponse p1 = new PolicyResponse(); p1.setId(1L);
        PolicyResponse p2 = new PolicyResponse(); p2.setId(2L);

        when(policyService.getPoliciesByCompany(10L)).thenReturn(Arrays.asList(p1, p2));

        mockMvc.perform(get("/api/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2));
    }

    @Test
    void testDeletePolicy_Success() throws Exception {
        doNothing().when(policyService).deletePolicy(1L, 10L);

        mockMvc.perform(delete("/api/policies/1"))
                .andExpect(status().isOk());
    }
}
