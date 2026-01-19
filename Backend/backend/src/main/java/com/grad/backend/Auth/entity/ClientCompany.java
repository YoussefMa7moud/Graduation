package com.grad.backend.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ClientCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Client client;

    private String companyName;
    private String description;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] logo;
}
