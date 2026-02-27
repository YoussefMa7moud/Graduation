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
public class SignatureVerificationDTO {
    private Long submissionId;
    private String contractTitle;

    private String clientName;
    private String clientSignatoryName;
    private LocalDateTime clientSignedAt;
    private String clientSignatureBase64;

    private String companyName;
    private String companySignatoryName;
    private LocalDateTime companySignedAt;
    private String companySignatureBase64;
}
