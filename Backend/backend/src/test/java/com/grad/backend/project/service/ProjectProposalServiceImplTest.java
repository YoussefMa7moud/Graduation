package com.grad.backend.project.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.DTO.ProjectProposalRequest;
import com.grad.backend.project.entity.ProjectProposal;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.repository.ProjectProposalRepository;
import com.grad.backend.project.repository.ProposalSubmissionRepository;

class ProjectProposalServiceImplTest {

    @Mock
    private ProjectProposalRepository proposalRepository;

    @Mock
    private ProposalSubmissionRepository submissionRepository;

    @Mock
    private ContractRecordRepository contractRepository;

    @InjectMocks
    private ProjectProposalServiceImpl projectProposalService;

    private ProjectProposal proposal;
    private ProjectProposalRequest request;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        proposal = new ProjectProposal();
        proposal.setId(1L);
        proposal.setClientId(10L);
        proposal.setProjectTitle("Test Project");

        request = new ProjectProposalRequest();
        request.setProjectTitle("Test Project Request");
    }

    @Test
    void testCreateProposal() {
        when(proposalRepository.save(any(ProjectProposal.class))).thenAnswer(i -> i.getArguments()[0]);

        ProjectProposal created = projectProposalService.createProposal(request, 10L);

        assertNotNull(created);
        assertEquals(10L, created.getClientId());
        assertEquals("Test Project Request", created.getProjectTitle());
        assertEquals("Pending", created.getStatus());
        verify(proposalRepository, times(1)).save(any(ProjectProposal.class));
    }

    @Test
    void testGetProposalsByClientId() {
        ProposalSubmission submission = new ProposalSubmission();
        submission.setId(100L);

        ContractRecord contract = new ContractRecord();

        when(proposalRepository.findByClientId(10L)).thenReturn(Arrays.asList(proposal));
        when(submissionRepository.findByProposal_Id(1L)).thenReturn(Arrays.asList(submission));
        when(contractRepository.findBySubmissionId(100L)).thenReturn(Arrays.asList(contract));

        List<ProjectProposal> result = projectProposalService.getProposalsByClientId(10L);

        assertEquals(1, result.size());
        assertTrue(result.get(0).isHasContract());
    }

    @Test
    void testDeleteProposal_Success() {
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));

        assertDoesNotThrow(() -> projectProposalService.deleteProposal(1L, 10L));
        verify(proposalRepository, times(1)).delete(proposal);
    }

    @Test
    void testDeleteProposal_Unauthorized() {
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));

        Exception ex = assertThrows(RuntimeException.class, () -> {
            projectProposalService.deleteProposal(1L, 99L);
        });

        assertEquals("You are not allowed to delete this proposal", ex.getMessage());
        verify(proposalRepository, never()).delete(any());
    }

    @Test
    void testUpdateProposal_Success() {
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));
        when(proposalRepository.save(any(ProjectProposal.class))).thenAnswer(i -> i.getArguments()[0]);

        ProjectProposal updated = projectProposalService.updateProposal(1L, request, 10L);

        assertEquals("Test Project Request", updated.getProjectTitle());
        verify(proposalRepository, times(1)).save(proposal);
    }
}
