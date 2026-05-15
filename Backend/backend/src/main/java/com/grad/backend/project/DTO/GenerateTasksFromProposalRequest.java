package com.grad.backend.project.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenerateTasksFromProposalRequest {

    @NotBlank(message = "Proposal text is required")
    @Size(max = 100_000, message = "Proposal text must not exceed 100,000 characters")
    private String proposalText;

    /** When true, existing tasks for the project are replaced by the new set. */
    private boolean replaceExisting = true;
}
