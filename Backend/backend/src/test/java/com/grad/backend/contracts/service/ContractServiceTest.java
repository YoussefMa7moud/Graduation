package com.grad.backend.contracts.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.grad.backend.contracts.repository.NdaSigningDraftRepository;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import com.grad.backend.config.InternalApiConfig;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import com.grad.backend.contracts.dto.NdaDraftResponse;

class ContractServiceTest {

    @Mock
    private NdaSigningDraftRepository draftRepo;
    @Mock
    private ContractRecordRepository recordRepository;
    @Mock
    private ProposalSubmissionRepository submissionRepository;
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private InternalApiConfig internalApiConfig;

    @InjectMocks
    private ContractService contractService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetDraft_NotAuthorized() {
        // When internalApiConfig returns empty URL, verifyActor falls back to repo
        when(internalApiConfig.getBaseUrl()).thenReturn("http://localhost:8080");
        when(internalApiConfig.getInternalKey()).thenReturn("test-key");
        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(), eq(java.util.Map.class)))
                .thenThrow(new RuntimeException("Connection refused"));
        when(submissionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> contractService.getDraft(1L, 99L));
    }


}
