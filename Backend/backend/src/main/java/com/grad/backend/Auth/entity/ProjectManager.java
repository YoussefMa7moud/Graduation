package com.grad.backend.Auth.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Project_Manager")
@Data
public class ProjectManager {

    @Id
    private Long id;

    @MapsId
    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}
