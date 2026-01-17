package com.grad.backend.user.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
public class ClientPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Client client;

    private String firstName;
    private String lastName;
}
