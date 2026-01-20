package com.grad.backend.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ClientPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String firstName;
    private String lastName;
}
