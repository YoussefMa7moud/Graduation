package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractRecordResponse {
    private Long id;
    private Long submissionId;
    private String contractType;
    private String fileName;
    private LocalDateTime signedAt;
    private LocalDateTime createdAt;
}
