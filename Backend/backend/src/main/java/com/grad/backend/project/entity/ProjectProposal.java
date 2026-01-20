package com.grad.backend.project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_proposals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false)
    private Long clientId; // Added as requested

    @Column(name = "project_title", nullable = false)
    private String projectTitle;

    @Column(name = "project_type", nullable = false)
    private String projectType; // Could also use an Enum

    @Column(columnDefinition = "TEXT", nullable = false)
    private String problemSolved;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mainFeatures;

    @Column(columnDefinition = "TEXT")
    private String userRoles;

    private String scalability = "Small";

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "budget_usd", precision = 12, scale = 2, nullable = false)
    private BigDecimal budgetUsd;

    @Column(name = "nda_required")
    private Boolean ndaRequired = false;

    @Column(name = "code_ownership", nullable = false)
    private String codeOwnership;

    @Column(name = "maintenance_period", nullable = false)
    private String maintenancePeriod;

    private String status = "Pending";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}