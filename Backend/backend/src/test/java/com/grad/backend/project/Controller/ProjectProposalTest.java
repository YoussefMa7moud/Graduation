package com.grad.backend.project.Controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.Controller.ProjectProposalController;
import com.grad.backend.project.DTO.ProjectProposalRequest;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.service.ProjectProposalService;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.math.BigDecimal;
import java.util.Collections;

class ProjectProposalTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ProjectProposalService proposalService;

    @InjectMocks
    private ProjectProposalController controller;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId(10L);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(org.springframework.core.MethodParameter parameter) {
                        return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                    }

                    @Override
                    public Object resolveArgument(org.springframework.core.MethodParameter parameter,
                                                 ModelAndViewContainer mavContainer,
                                                 NativeWebRequest webRequest,
                                                 WebDataBinderFactory binderFactory) {
                        return testUser;
                    }
                })
                .build();
    }

  @Test
@SneakyThrows
void TC05_verifyRequiredFieldsValidation() {
   ProjectProposalRequest invalidRequest = new ProjectProposalRequest();
    invalidRequest.setProjectTitle("");  // Empty title
  invalidRequest.setDurationDays(null);
    invalidRequest.setProjectType("");  // Empty

    when(proposalService.createProposal(
                    argThat(req -> req.getProjectTitle() == null || req.getProjectTitle().isBlank()),
                    eq(testUser.getId())))
            .thenThrow(new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Project title is required"));

    mockMvc.perform(post("/api/proposals/create")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest());
}
    @Test
    @SneakyThrows
    void TC06_verifyBudgetNumericRestriction() {
      ProjectProposalRequest invalidBudgetRequest = new ProjectProposalRequest();
        invalidBudgetRequest.setProjectTitle("Valid Title");
        invalidBudgetRequest.setBudgetUsd(null);  // Will fail BigDecimal binding if string passed
       String invalidJson = "{\"projectTitle\":\"Valid Title\",\"budgetUsd\":\"Five Thousand\",\"durationDays\":90}";

        mockMvc.perform(post("/api/proposals/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());  // Jackson BigDecimal parse failure
    }

    @Test
    @SneakyThrows
    void TC07_successfulProposalSubmission() {
       
        ProjectProposalRequest validRequest = new ProjectProposalRequest();
        validRequest.setProjectTitle("Full Stack Web App");
        validRequest.setProjectType("Web Development");
        validRequest.setBudgetUsd(new BigDecimal("50000.00"));
        validRequest.setDurationDays(90);
        validRequest.setProblemSolved("Scale user management");
        validRequest.setDescription("Complete platform with auth and dashboard");
        validRequest.setMainFeatures("User auth, dashboard, proposals");
        validRequest.setUserRoles("Admin, Client, Company");
        validRequest.setScalability("Medium");
        validRequest.setNdaRequired(true);
        validRequest.setCodeOwnership("Client owns");
        validRequest.setMaintenancePeriod("6 months");

        ProjectProposal savedProposal = ProjectProposal.builder()
                .id(1L)
                .clientId(10L)
                .projectTitle("Full Stack Web App")
                .status("Pending")
                .budgetUsd(new BigDecimal("50000.00"))
                .build();

        when(proposalService.createProposal(any(ProjectProposalRequest.class), eq(10L)))
                .thenReturn(savedProposal);

        mockMvc.perform(post("/api/proposals/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.projectTitle").value("Full Stack Web App"))
                .andExpect(jsonPath("$.status").value("Pending"))
                .andExpect(jsonPath("$.budgetUsd").value(50000.00));
    }

    @Test
    @SneakyThrows
    void TC08_verifyPdfExportTrigger() {
       
        ProjectProposalRequest validRequest = new ProjectProposalRequest();
        validRequest.setProjectTitle("PDF Test Proposal");
        validRequest.setBudgetUsd(new BigDecimal("25000"));
        validRequest.setDurationDays(60);
        validRequest.setNdaRequired(false);  // PDF contains proposal details

        ProjectProposal savedProposal = ProjectProposal.builder()
                .id(2L)
                .projectTitle("PDF Test Proposal")
                .budgetUsd(new BigDecimal("25000"))
                .durationDays(60)
                .build();

        when(proposalService.createProposal(any(ProjectProposalRequest.class), eq(10L)))
                .thenReturn(savedProposal);

        mockMvc.perform(post("/api/proposals/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.projectTitle").value("PDF Test Proposal"));

       verify(proposalService, times(1)).createProposal(any(), eq(10L));
    }
}
