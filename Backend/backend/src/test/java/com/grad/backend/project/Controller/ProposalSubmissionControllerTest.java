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
import com.grad.backend.project.DTO.SubmitToCompanyRequest;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.service.ProposalSubmissionService;

class ProposalSubmissionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProposalSubmissionService submissionService;

    @InjectMocks
    private ProposalSubmissionController controller;

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
    void testSubmitToCompany() throws Exception {
        SubmitToCompanyRequest request = new SubmitToCompanyRequest();
        request.setProposalId(1L);
        request.setSoftwareCompanyId(5L);

        ProposalSubmission submission = new ProposalSubmission();
        submission.setId(100L);

        // Controller maps proposal.getId() and softwareCompany.getId() - must populate
        com.grad.backend.project.entity.ProjectProposal proposal = new com.grad.backend.project.entity.ProjectProposal();
        proposal.setId(1L);
        submission.setProposal(proposal);

        com.grad.backend.Auth.entity.Company company = new com.grad.backend.Auth.entity.Company();
        company.setId(5L);
        submission.setSoftwareCompany(company);
        submission.setStatus(com.grad.backend.project.enums.SubmissionStatus.WAITING_FOR_COMPANY);

        when(submissionService.sendProposalToCompany(eq(1L), eq(5L), any(User.class))).thenReturn(submission);

        mockMvc.perform(post("/api/submissions/send-to-company")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
