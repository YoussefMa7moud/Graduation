package com.grad.backend.Auth.entity;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ClientCompany {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @MapsId
    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    private String companyName;
    private String description;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] logo;
}
