package com.grad.backend.Auth.entity;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ClientPerson {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @MapsId
    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    private String firstName;
    private String lastName;
}
