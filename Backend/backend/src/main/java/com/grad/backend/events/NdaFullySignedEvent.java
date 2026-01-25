package com.grad.backend.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NdaFullySignedEvent extends ApplicationEvent {

    private final Long submissionId;

    public NdaFullySignedEvent(Object source, Long submissionId) {
        super(source);
        this.submissionId = submissionId;
    }
}
