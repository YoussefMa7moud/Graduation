package com.grad.backend.project.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.enums.ClientType;
import com.grad.backend.project.enums.SubmissionStatus;
import com.grad.backend.project.repository.ProjectProposalRepository;
import com.grad.backend.project.repository.ProposalSubmissionRepository;

class ProposalSubmissionServiceTest {

    @Mock
    private ProposalSubmissionRepository submissionRepository;
    @Mock
    private ProjectProposalRepository proposalRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private ClientCompanyRepository clientCompanyRepo;
    @Mock
    private ClientPersonRepository clientPersonRepo;
    @Mock
    private ContractRecordRepository contractRepository;
    @Mock
    private CompanyEmployeeRepository companyEmployeeRepository;

    @InjectMocks
    private ProposalSubmissionService submissionService;

    private User clientUser;
    private ProjectProposal proposal;
    private Company company;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        clientUser = new User();
        clientUser.setId(10L);
        clientUser.setRole(UserRole.CLIENT_PERSON);

        proposal = new ProjectProposal();
        proposal.setId(1L);
        proposal.setStatus("Pending");

        company = new Company();
        company.setId(5L);
        User companyUser = new User();
        companyUser.setId(50L);
        company.setUser(companyUser);
    }

    @Test
    void testSendProposal_NewSubmission() {
        when(submissionRepository.findByProposal_Id(1L)).thenReturn(Collections.emptyList());
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));
        when(companyRepository.findById(5L)).thenReturn(Optional.of(company));
        when(submissionRepository.save(any(ProposalSubmission.class))).thenAnswer(i -> {
            ProposalSubmission sub = i.getArgument(0);
            sub.setId(100L);
            return sub;
        });

        ProposalSubmission result = submissionService.sendProposalToCompany(1L, 5L, clientUser);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Enrolled", proposal.getStatus());
        assertEquals(ClientType.INDIVIDUAL, result.getClientType());
        
        verify(proposalRepository, times(1)).save(proposal);
        verify(submissionRepository, times(1)).save(any(ProposalSubmission.class));
    }

    @Test
    void testUpdateStatus() {
        ProposalSubmission submission = new ProposalSubmission();
        submission.setId(100L);
        submission.setProposal(proposal);

        when(submissionRepository.findById(100L)).thenReturn(Optional.of(submission));

        submissionService.updateStatus(100L, SubmissionStatus.REJECTED_WITH_NOTE, "Not a fit");

        assertEquals(SubmissionStatus.REJECTED_WITH_NOTE, submission.getStatus());
        assertEquals("Not a fit", submission.getRejectionNote());
        assertEquals("Rejected with Note", proposal.getStatus());

        verify(submissionRepository, times(1)).save(submission);
        verify(proposalRepository, times(1)).save(proposal);
    }

    @Test
    void testDeleteSubmission() {
        ProposalSubmission submission = new ProposalSubmission();
        submission.setId(100L);
        submission.setProposal(proposal);

        when(submissionRepository.findById(100L)).thenReturn(Optional.of(submission));
        when(contractRepository.findBySubmissionId(100L)).thenReturn(Collections.emptyList());

        submissionService.deleteSubmission(100L);

        assertEquals("Pending", proposal.getStatus());
        verify(submissionRepository, times(1)).deleteById(100L);
        verify(proposalRepository, times(1)).save(proposal);
    }

    @Test
    void testVerifyActor_Client() {
        ProposalSubmission submission = new ProposalSubmission();
        submission.setId(100L);
        submission.setClient(clientUser);
        
        when(submissionRepository.findById(100L)).thenReturn(Optional.of(submission));

        String actor = submissionService.verifyActor(100L, 10L);
        assertEquals("client", actor);
    }
}
