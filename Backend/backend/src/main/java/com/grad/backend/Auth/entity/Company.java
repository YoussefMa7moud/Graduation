package com.grad.backend.Auth.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.util.Objects;

@Entity
@Table(name = "company")
@Data
public class Company {

    @Id
    private Long id;

    @MapsId
    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    private String name;
    private String description;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] logo;

    private String nationalId;
    private String title; // CEO / CTO / Legal Rep
    private String companyRegNo;
    private String phoneNumber;
}
