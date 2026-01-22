package com.grad.backend.project.DTO;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionResponseDTO {
    private Long id;
    private String status;
    private Long proposalId;
    private Long companyId;
    private LocalDateTime updatedAt;
    private String proposalTitle;   // Added
    private String companyName;     // Added
    private String content;         // Added
}