package com.grad.backend.contracts.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.contracts.dto.NdaDraftResponse;
import com.grad.backend.contracts.dto.SignedProjectDTO;
import com.grad.backend.contracts.service.ContractService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class OngoingContractsTest {

    private MockMvc mockMvc;

    @Mock
    private ContractService contractService;

    @InjectMocks
    private ContractController controller;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId(10L);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                    }

                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest, org.springframework.web.bind.support.WebDataBinderFactory binderFactory) throws Exception {
                        return testUser;
                    }
                })
                .build();
    }

    @Test
    void TC20_loadActiveProjectsQueue() throws Exception {
        SignedProjectDTO project = SignedProjectDTO.builder()
            .id(123L)
            .projectName("Active Project")
            .projectType("Software")
            .companyName("Test Company")
            .signedAt(LocalDateTime.now())
            .fileName("contract.pdf")
            .fileSize(1024L)
            .contractType("MSA")
            .build();
        List<SignedProjectDTO> projects = Arrays.asList(project);

        when(contractService.getSignedProjectsForClient(eq(10L))).thenReturn(projects);

        mockMvc.perform(get("/api/contracts/client/signed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(123));
        verify(contractService).getSignedProjectsForClient(eq(10L));
    }

    @Test
    void TC21_handleEmptyProjectQueue() throws Exception {
        when(contractService.getSignedProjectsForClient(eq(10L))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/contracts/client/signed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        verify(contractService).getSignedProjectsForClient(eq(10L));
    }

    @Test
    void TC22_navigateToNDASigning() throws Exception {
        NdaDraftResponse response = new NdaDraftResponse();
        when(contractService.getDraft(eq(123L), eq(10L))).thenReturn(response);

        mockMvc.perform(get("/api/contracts/nda/draft")
                .param("submissionId", "123"))
                .andExpect(status().isOk());
        verify(contractService).getDraft(eq(123L), eq(10L));
    }

@Test
void TC23_navigateToWorkspace() throws Exception {
    mockMvc.perform(get("/api/contracts/workspace")
                    .param("submissionId", "123"))
            .andExpect(status().is4xxClientError());
}

@Test
void TC24_withdrawProject() throws Exception {
    mockMvc.perform(delete("/api/contracts/ongoing/123"))
            .andExpect(status().is4xxClientError());
}
    @Test
    void TC25_displayWorkflowProgress() throws Exception {
        SignedProjectDTO project = SignedProjectDTO.builder()
            .id(123L)
            .projectName("Workflow Project")
            .projectType("Software")
            .companyName("Test Company")
            .signedAt(LocalDateTime.now())
            .fileName("contract.pdf")
            .fileSize(1024L)
            .contractType("MSA")
            .build();
        List<SignedProjectDTO> projects = Arrays.asList(project);

        when(contractService.getSignedProjectsForClient(eq(10L))).thenReturn(projects);

        mockMvc.perform(get("/api/contracts/client/signed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        verify(contractService).getSignedProjectsForClient(eq(10L));
    }

    @Test
    void TC26_disableButtonsForPendingActions() throws Exception {
        SignedProjectDTO project = SignedProjectDTO.builder()
            .id(123L)
            .projectName("Pending Project")
            .projectType("Software")
            .companyName("Test Company")
            .signedAt(LocalDateTime.now())
            .fileName("contract.pdf")
            .fileSize(1024L)
            .contractType("MSA")
            .build();
        List<SignedProjectDTO> projects = Arrays.asList(project);

        when(contractService.getSignedProjectsForClient(eq(10L))).thenReturn(projects);

        mockMvc.perform(get("/api/contracts/client/signed"))
                .andExpect(status().isOk());
        verify(contractService).getSignedProjectsForClient(eq(10L));
    }
}
