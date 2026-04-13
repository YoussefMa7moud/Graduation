package com.grad.backend.project.Controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.grad.backend.project.enums.SubmissionStatus;
import com.grad.backend.project.service.ProposalSubmissionService;

class InternalSubmissionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProposalSubmissionService submissionService;

    @InjectMocks
    private InternalSubmissionController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testVerifyActor_Unauthorized() throws Exception {
        // Missing key -> should return 401
        mockMvc.perform(get("/api/internal/submissions/100/verify-actor")
                .param("userId", "1"))
                .andExpect(status().isUnauthorized());
    }
}
