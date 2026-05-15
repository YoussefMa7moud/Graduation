package com.grad.backend.project.entity;

import com.grad.backend.project.enums.ProjectPhase;
import com.grad.backend.project.enums.TaskPriority;
import com.grad.backend.project.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_tasks", indexes = {
        @Index(name = "idx_project_tasks_company_project", columnList = "company_project_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_project_id", nullable = false)
    private Long companyProjectId;

    @Column(nullable = false, length = 500)
    private String title;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority;

    @Column(name = "estimated_duration", length = 100)
    private String estimatedDuration;

    @Column(name = "suggested_assignee", length = 255)
    private String suggestedAssignee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Column(name = "dependencies_json", columnDefinition = "TEXT")
    private String dependenciesJson;

    @Column(length = 255)
    private String milestone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectPhase phase;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
