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
}
