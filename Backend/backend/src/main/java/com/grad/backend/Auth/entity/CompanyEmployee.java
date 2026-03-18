package com.grad.backend.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "company_employee")
@Data
public class CompanyEmployee {

    @Id
    private Long id;

    @MapsId
    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column
    private String nationalId;

    @Column
    private String title;

    @Column(nullable = false)
    private boolean canViewContracts;

    @Column(nullable = false)
    private boolean canAddPolicy;

    @Column(nullable = false)
    private boolean canSignContract;

    @Column(nullable = false)
    private boolean canAcceptProposals;
}
