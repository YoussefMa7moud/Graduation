package com.grad.backend.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private String name;
    private String description;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] logo;
}
