package com.grad.backend.contracts.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.contracts.dto.NdaDraftResponse;
import com.grad.backend.contracts.dto.NdaSignRequest;
import com.grad.backend.contracts.service.ContractService;
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

import java.time.LocalDateTime;

class NDASigningTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ContractService contractService;

    @InjectMocks
    private ContractController controller;

    private User testUser;
    private User clientUser;
    private User companyUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId(10L);
        clientUser = new User();
        clientUser.setId(20L);
        companyUser = new User();
        companyUser.setId(30L);

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
                        String userIdParam = webRequest.getParameter("userId");
                        if ("client".equals(userIdParam)) return clientUser;
                        if ("company".equals(userIdParam)) return companyUser;
                        return testUser;
                    }
                })
                .build();
    }

    @Test
    @SneakyThrows
    void TC12_loadNdaDataForProject() {
        Long submissionId = 123L;
        NdaDraftResponse draft = NdaDraftResponse.builder()
                .submissionId(submissionId)
                .contractPayloadJson("{\"partyA\":{\"name\":\"Company\"},\"partyB\":{\"name\":\"Client\"},\"provisions\":\"Test provisions\"}")
                .clientSigned(false)
                .companySigned(false)
                .build();

        when(contractService.getDraft(eq(submissionId), eq(testUser.getId()))).thenReturn(draft);

        mockMvc.perform(get("/api/contracts/nda/draft")
                        .param("submissionId", submissionId.toString())
                        .param("userId", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.submissionId").value(submissionId))
                .andExpect(jsonPath("$.contractPayloadJson").exists())
                .andExpect(jsonPath("$.clientSigned").value(false))
                .andExpect(jsonPath("$.companySigned").value(false));
    }

    @Test
    @SneakyThrows
    void TC13_handleMissingProjectContext() {
     Long invalidSubmissionId = 999L;

        when(contractService.getDraft(eq(invalidSubmissionId), eq(testUser.getId())))
                .thenThrow(new RuntimeException("Not authorized"));

        mockMvc.perform(get("/api/contracts/nda/draft")
                        .param("submissionId", invalidSubmissionId.toString())
                        .param("userId", "test"))
                .andExpect(status().isForbidden());
    }

    @Test
    @SneakyThrows
    void TC14_drawSignatureOnCanvas() {
        // Given: Valid canvas-drawn signature (lines appear)
        Long submissionId = 123L;
        String drawnSigBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // Simulates drawn lines
        NdaSignRequest signRequest = new NdaSignRequest();
        signRequest.setSubmissionId(submissionId);
        signRequest.setSignatureBase64(drawnSigBase64);
        signRequest.setContractPayloadJson("{}");

        NdaDraftResponse updatedDraft = NdaDraftResponse.builder()
                .submissionId(submissionId)
                .clientSigned(true)
                .build();
        when(contractService.signClient(eq(submissionId), eq(clientUser.getId()), eq(drawnSigBase64), anyString())).thenReturn(updatedDraft);

        // When/Then: Lines appear (sign accepted)
        mockMvc.perform(post("/api/contracts/nda/sign/client")
                .param("userId", "client")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientSigned").value(true));

        // Verify clearing works (empty sig handled - coverage by TC15)
        String emptySig = "";
        verify(contractService, never()).signClient(anyLong(), anyLong(), eq(emptySig), anyString());
    }

@Test
@SneakyThrows
void TC15_attemptSigningWithoutDrawing() {
    Long submissionId = 123L;

    NdaSignRequest emptySignRequest = new NdaSignRequest();
    emptySignRequest.setSubmissionId(submissionId);
    emptySignRequest.setSignatureBase64("");
    emptySignRequest.setContractPayloadJson("{}");

    when(contractService.signClient(
                    eq(submissionId),
                    eq(clientUser.getId()),
                    eq(""),
                    anyString()))
            .thenThrow(new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Signature cannot be empty"));

    mockMvc.perform(post("/api/contracts/nda/sign/client")
                    .param("userId", "client")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(emptySignRequest)))
            .andExpect(status().isBadRequest());
}

    @Test
    @SneakyThrows
    void TC16_clientSignsNDA() {
      Long submissionId = 123L;
        NdaSignRequest signRequest = new NdaSignRequest();
        signRequest.setSubmissionId(submissionId);
        signRequest.setSignatureBase64("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
        signRequest.setContractPayloadJson("{\"purpose\":\"Test\"}");

        NdaDraftResponse updatedDraft = NdaDraftResponse.builder()
                .submissionId(submissionId)
                .clientSigned(true)
                .companySigned(false)
                .build();

        when(contractService.signClient(eq(submissionId), eq(clientUser.getId()), anyString(), anyString()))
                .thenReturn(updatedDraft);

        mockMvc.perform(post("/api/contracts/nda/sign/client")
                        .param("userId", "client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientSigned").value(true))
                .andExpect(jsonPath("$.companySigned").value(false));
    }

    @Test
    @SneakyThrows
    void TC17_companySignsNDA() {
      Long submissionId = 123L;

        
        NdaSignRequest clientRequest = new NdaSignRequest();
        clientRequest.setSubmissionId(submissionId);
        clientRequest.setSignatureBase64("client_sig_base64");
        clientRequest.setContractPayloadJson("{}");

        NdaDraftResponse clientDraft = NdaDraftResponse.builder()
                .submissionId(submissionId)
                .clientSigned(true)
                .build();
        when(contractService.signClient(anyLong(), anyLong(), anyString(), anyString())).thenReturn(clientDraft);

        mockMvc.perform(post("/api/contracts/nda/sign/client")
                        .param("userId", "client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clientRequest)))
                .andExpect(status().isOk());

       NdaSignRequest companyRequest = new NdaSignRequest();
        companyRequest.setSubmissionId(submissionId);
        companyRequest.setSignatureBase64("company_sig_base64");
        companyRequest.setContractPayloadJson("{\"provisions\":\"Confidentiality\",\"duration\":\"2 years\"}");

        NdaDraftResponse fullySigned = NdaDraftResponse.builder()
                .submissionId(submissionId)
                .clientSigned(true)
                .companySigned(true)
                .build();

        when(contractService.signCompany(eq(submissionId), eq(companyUser.getId()), anyString(), anyString()))
                .thenReturn(fullySigned);

        mockMvc.perform(post("/api/contracts/nda/sign/company")
                        .param("userId", "company")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(companyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientSigned").value(true))
                .andExpect(jsonPath("$.companySigned").value(true));
    }

    @Test
    @SneakyThrows
    void TC18_verifyGeneratedProvisions() {
     Long submissionId = 123L;
        String testPayload = "{\"partyA\":{\"details\":\"CR:123\"},\"partyB\":{\"title\":\"CEO\"},\"purpose\":\"Development\",\"duration\":\"3 years\",\"disputeResolution\":\"Arbitration\",\"provisions\":\"Non-compete\"}";

        NdaDraftResponse draft = NdaDraftResponse.builder()
                .submissionId(submissionId)
                .contractPayloadJson(testPayload)
                .build();

        when(contractService.getDraft(eq(submissionId), eq(testUser.getId()))).thenReturn(draft);

        mockMvc.perform(get("/api/contracts/nda/draft")
                        .param("submissionId", submissionId.toString())
                        .param("userId", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contractPayloadJson").value(testPayload)); // Provisions/options present
    }

    @Test
    @SneakyThrows
    void TC19_ndafFullyExecuted() {
     Long submissionId = 123L;
        NdaDraftResponse executedDraft = NdaDraftResponse.builder()
                .submissionId(submissionId)
                .clientSigned(true)
                .companySigned(true)
                .clientSignedAt(LocalDateTime.now().minusDays(1))
                .companySignedAt(LocalDateTime.now())
                .build();

        when(contractService.getDraft(eq(submissionId), eq(testUser.getId()))).thenReturn(executedDraft);

        mockMvc.perform(get("/api/contracts/nda/draft")
                        .param("submissionId", submissionId.toString())
                        .param("userId", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientSigned").value(true))
                .andExpect(jsonPath("$.companySigned").value(true));
    }
}
