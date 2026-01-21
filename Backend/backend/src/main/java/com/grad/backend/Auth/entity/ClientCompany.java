package com.grad.backend.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "client_company")
@Data
public class ClientCompany {

    @Id
    private Long id;

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
