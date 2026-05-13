package com.grad.backend.contracts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contract_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", nullable = false)
    private Long submissionId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "contract_type", nullable = false)
    private String contractType;

    @Lob
    @Column(name = "pdf_bytes", columnDefinition = "LONGBLOB", nullable = false)
    private byte[] pdfBytes;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "signed_at", nullable = false)
    private LocalDateTime signedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "client_signed_at")
    private LocalDateTime clientSignedAt;

    @Column(name = "client_signature_base64", columnDefinition = "LONGTEXT")
    private String clientSignatureBase64;

    @Column(name = "company_signature_base64", columnDefinition = "LONGTEXT")
    private String companySignatureBase64;

    @Column(name = "client_signatory_name")
    private String clientSignatoryName;

    @Column(name = "company_signatory_name")
    private String companySignatoryName;

    @Column(name = "contract_payload_json", columnDefinition = "LONGTEXT")
    private String contractPayloadJson;

    @Column(name = "contract_hash", length = 64)
    private String contractHash;

    @Column(name = "contract_password", length = 128)
    private String contractPassword;
}
