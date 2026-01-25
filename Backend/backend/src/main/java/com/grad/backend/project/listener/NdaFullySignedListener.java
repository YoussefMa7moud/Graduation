package com.grad.backend.project.listener;

import com.grad.backend.events.NdaFullySignedEvent;
import com.grad.backend.project.enums.SubmissionStatus;
import com.grad.backend.project.service.ProposalSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NdaFullySignedListener {

    private final ProposalSubmissionService submissionService;

    @EventListener
    public void onNdaFullySigned(NdaFullySignedEvent event) {
        submissionService.updateStatus(event.getSubmissionId(), SubmissionStatus.REVIEWING, null);
    }
}
