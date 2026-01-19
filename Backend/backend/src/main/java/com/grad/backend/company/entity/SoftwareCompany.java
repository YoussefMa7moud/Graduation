package com.grad.backend.company.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "company") // Ensure this matches your actual table name exactly
public class SoftwareCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // bigint(20) maps to Long

    private String name; // varchar(255)
    
    private String description; // varchar(255)

    @Lob
    @Column(name = "logo", columnDefinition = "LONGBLOB")
    private byte[] logo; // longblob maps to byte array

    @Column(name = "user_id")
    private Long userId; // bigint(20)

    // Standard Getters and Setters
    public Long getId() { return id; }
 

    public String getName() { return name; }
  

    public String getDescription() { return description; }
   

    public byte[] getLogo() { return logo; }
  

    public Long getUserId() { return userId; }
    
}