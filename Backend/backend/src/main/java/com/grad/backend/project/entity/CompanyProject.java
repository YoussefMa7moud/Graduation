package com.grad.backend.project.entity;

import com.grad.backend.Auth.entity.ProjectManager;
import com.grad.backend.contracts.entity.ContractRecord;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "company_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_record_id", nullable = false)
    private ContractRecord contractRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id", nullable = false)
    private ProjectManager projectManager;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Lob
    @Column(name = "ocl_rules", columnDefinition = "LONGTEXT")
    private String oclRules;

    @Lob
    @Column(name = "guidelines", columnDefinition = "LONGTEXT")
    private String guidelines;

    @Lob
    @Column(name = "project_summary", columnDefinition = "LONGTEXT")
    private String projectSummary;

    /** Per-field HTML from the technical document editor, stored as a JSON object string. */
    @Lob
    @Column(name = "technical_document_json", columnDefinition = "LONGTEXT")
    private String technicalDocumentJson;

    /** Last tech-doc validation outcome (violations, etc.) as JSON; written when validation reports issues. */
    @Lob
    @Column(name = "technical_document_validation_json", columnDefinition = "LONGTEXT")
    private String technicalDocumentValidationJson;

    @Column(name = "status", nullable = false)
    private String status = "ASSIGNED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
