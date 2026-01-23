package com.grad.backend.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Objects;

@Entity
@Table(name = "client_person")
@Data
public class ClientPerson {

    @Id
    private Long id;

    @MapsId
    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    private String firstName;
    private String lastName;
}
