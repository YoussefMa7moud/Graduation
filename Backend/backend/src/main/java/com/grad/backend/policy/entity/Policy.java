package com.grad.backend.policy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "policy_name", nullable = false)
    private String policyName;

    @Column(name = "legal_framework", nullable = false)
    private String legalFramework;

    @Column(name = "policy_text", columnDefinition = "TEXT", nullable = false)
    private String policyText;

    @Column(name = "ocl_code", columnDefinition = "TEXT", nullable = false)
    private String oclCode;

    @Column(name = "category")
    private String category;

    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "article_ref")
    private String articleRef;

    @Column(name = "file_path")
    private String filePath;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
