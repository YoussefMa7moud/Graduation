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
public class NdaDraftResponse {
    private Long id;
    private Long submissionId;
    private LocalDateTime clientSignedAt;
    private LocalDateTime companySignedAt;
    private String contractPayloadJson;
    private boolean clientSigned;
    private boolean companySigned;
}
