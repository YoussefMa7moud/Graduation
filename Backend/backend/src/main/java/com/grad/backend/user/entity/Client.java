package com.grad.backend.user.entity;

import com.grad.backend.user.enums.ClientType;
import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private ClientType clientType;
}

