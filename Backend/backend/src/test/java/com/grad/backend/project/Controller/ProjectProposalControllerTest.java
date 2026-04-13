package com.grad.backend.project.Controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.DTO.ProjectProposalRequest;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.service.ProjectProposalService;

import java.util.Collections;

class ProjectProposalControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProjectProposalService proposalService;

    @InjectMocks
    private ProjectProposalController controller;

    private User testUser;
    private ObjectMapper objectMapper = new ObjectMapper();

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
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mav,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binder) {
                        return testUser;
                    }
                })
                .build();
    }

    @Test
    void testCreateProposal() throws Exception {
        ProjectProposalRequest request = new ProjectProposalRequest();
        request.setProjectTitle("Test");

        ProjectProposal response = new ProjectProposal();
        response.setId(1L);

        when(proposalService.createProposal(any(ProjectProposalRequest.class), eq(10L))).thenReturn(response);

        mockMvc.perform(post("/api/proposals/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void testGetMyProposals() throws Exception {
        when(proposalService.getProposalsByClientId(10L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/proposals/MyProposals/{clientId}", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }
}
