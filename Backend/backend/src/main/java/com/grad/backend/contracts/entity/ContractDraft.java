package com.grad.backend.contracts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contract_drafts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", nullable = false, unique = true)
    private Long submissionId;

    @Column(name = "contract_payload_json", columnDefinition = "LONGTEXT", nullable = false)
    private String contractPayloadJson;

    @Column(name = "ai_validated", nullable = false)
    @Builder.Default
    private Boolean aiValidated = false;

    @Column(name = "ocl_validated", nullable = false)
    @Builder.Default
    private Boolean oclValidated = false;

    @Column(name = "sent_to_client", nullable = false)
    @Builder.Default
    private Boolean sentToClient = false;

    @Column(name = "client_signed_at")
    private LocalDateTime clientSignedAt;

    @Column(name = "client_signature_base64", columnDefinition = "LONGTEXT")
    private String clientSignatureBase64;

    @Column(name = "company_signed_at")
    private LocalDateTime companySignedAt;

    @Column(name = "company_signature_base64", columnDefinition = "LONGTEXT")
    private String companySignatureBase64;

    @Column(name = "validation_results_json", columnDefinition = "LONGTEXT")
    private String validationResultsJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
