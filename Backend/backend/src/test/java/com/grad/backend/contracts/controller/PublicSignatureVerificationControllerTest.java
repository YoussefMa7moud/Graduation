package com.grad.backend.contracts.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.project.repository.ProposalSubmissionRepository;

class PublicSignatureVerificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ContractRecordRepository contractRepository;

    @Mock
    private ProposalSubmissionRepository submissionRepository;

    @Mock
    private ClientPersonRepository clientPersonRepo;

    @Mock
    private ClientCompanyRepository clientCompanyRepo;

    @InjectMocks
    private PublicSignatureVerificationController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testVerifyContract_ValidSignature() throws Exception {
        ContractRecord record = new ContractRecord();
        record.setContractType("NDA_CONTRACT");
        record.setClientSignatureBase64("base64");

        // Must have a client set on submission to avoid NPE in controller
        com.grad.backend.Auth.entity.User client = new com.grad.backend.Auth.entity.User();
        client.setId(5L);

        ProposalSubmission submission = new ProposalSubmission();
        ProjectProposal proposal = new ProjectProposal();
        proposal.setProjectTitle("Test");
        submission.setProposal(proposal);
        submission.setClient(client);
        submission.setClientType(com.grad.backend.project.enums.ClientType.INDIVIDUAL);

        when(contractRepository.findBySubmissionId(10L)).thenReturn(java.util.Collections.singletonList(record));
        when(submissionRepository.findById(10L)).thenReturn(Optional.of(submission));

        mockMvc.perform(get("/api/public/signature-verification/{submissionId}", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contractTitle").value("NDA CONTRACT"));
    }

    @Test
    void testVerifyContract_InvalidSignature() throws Exception {
        when(contractRepository.findBySubmissionId(99L)).thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(get("/api/public/signature-verification/{submissionId}", 99L))
                .andExpect(status().isNotFound());
    }
}
