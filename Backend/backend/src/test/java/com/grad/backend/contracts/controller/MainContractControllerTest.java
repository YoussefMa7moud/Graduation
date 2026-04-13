package com.grad.backend.contracts.controller;

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

import com.grad.backend.Auth.entity.User;
import com.grad.backend.contracts.dto.ContractDraftResponse;
import com.grad.backend.contracts.entity.ContractDraft;
import com.grad.backend.contracts.service.MainContractService;

class MainContractControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MainContractService mainContractService;

    @InjectMocks
    private MainContractController controller;

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
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mav,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binder) {
                        return testUser;
                    }
                })
                .build();
    }

    @Test
    void testGetMainContractDraft() throws Exception {
        ContractDraftResponse draft = ContractDraftResponse.builder().id(55L).contractPayloadJson("<p>Main</p>").build();

        when(mainContractService.getDraft(1L, 10L)).thenReturn(draft);

        mockMvc.perform(get("/api/contracts/main/draft").param("submissionId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(55))
                .andExpect(jsonPath("$.contractPayloadJson").value("<p>Main</p>"));
    }
}
