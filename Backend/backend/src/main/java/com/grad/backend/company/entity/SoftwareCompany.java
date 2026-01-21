package com.grad.backend.company.entity;

import jakarta.persistence.*;
import com.grad.backend.Auth.entity.User;
import lombok.Data;

@Entity
@Table(name = "company")
@Data
public class SoftwareCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

 

    private String name;
    private String description;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] logo;
}
