package com.grad.backend.project.entity;

import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.project.enums.ClientType;
import com.grad.backend.project.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "proposal_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProposalSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The Client (Can be ClientPerson or ClientCompany, both share the User ID)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    // The Software Company receiving the proposal
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "software_company_id", nullable = false)
    private Company softwareCompany;

    // The actual Project Proposal details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id", nullable = false)
    private ProjectProposal proposal;

    @Enumerated(EnumType.STRING)
    @Column(name = "client_type", nullable = false)
    private ClientType clientType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.WAITING_FOR_COMPANY;

    // Extra field: To store the reason if "REJECTED_WITH_NOTE" is selected
    @Column(columnDefinition = "TEXT")
    private String rejectionNote;

    // Extra field: Tracking if the company has seen it yet
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "proposed_at", updatable = false)
    private LocalDateTime proposedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}