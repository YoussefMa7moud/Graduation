package com.grad.backend.contracts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "nda_signing_drafts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NdaSigningDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", nullable = false, unique = true)
    private Long submissionId;

    @Column(name = "client_signed_at")
    private LocalDateTime clientSignedAt;

    @Column(name = "client_signature_base64", columnDefinition = "LONGTEXT")
    private String clientSignatureBase64;

    @Column(name = "company_signed_at")
    private LocalDateTime companySignedAt;

    @Column(name = "company_signature_base64", columnDefinition = "LONGTEXT")
    private String companySignatureBase64;

    @Column(name = "contract_payload_json", columnDefinition = "LONGTEXT", nullable = false)
    private String contractPayloadJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
