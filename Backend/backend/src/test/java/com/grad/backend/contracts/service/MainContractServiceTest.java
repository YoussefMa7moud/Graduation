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

import com.grad.backend.contracts.entity.ContractDraft;
import com.grad.backend.contracts.repository.ContractDraftRepository;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import com.grad.backend.project.service.ProposalSubmissionService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.client.RestTemplate;

import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.contracts.repository.ContractChatMessageRepository;
import com.grad.backend.policy.repository.PolicyRepository;
import com.grad.backend.config.InternalApiConfig;

class MainContractServiceTest {

    @Mock
    private ContractDraftRepository draftRepo;
    @Mock
    private ContractRecordRepository contractRepo;
    @Mock
    private ContractChatMessageRepository chatMessageRepository;
    @Mock
    private ProposalSubmissionRepository submissionRepo;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private CompanyEmployeeRepository companyEmployeeRepository;
    @Mock
    private ClientCompanyRepository clientCompanyRepo;
    @Mock
    private ClientPersonRepository clientPersonRepo;
    @Mock
    private PolicyRepository policyRepository;
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private InternalApiConfig internalApiConfig;

    @InjectMocks
    private MainContractService mainContractService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }


    @Test
    void testGetDraft_NotAuthorized() {
        when(internalApiConfig.getBaseUrl()).thenReturn("http://localhost:8080");
        when(internalApiConfig.getInternalKey()).thenReturn("test-key");
        when(restTemplate.exchange(anyString(), any(org.springframework.http.HttpMethod.class),
                any(), eq(java.util.Map.class)))
                .thenThrow(new RuntimeException("Connection refused"));
        when(submissionRepo.findById(1L)).thenReturn(java.util.Optional.empty());

        assertThrows(RuntimeException.class, () -> mainContractService.getDraft(1L, 10L));
    }
}
