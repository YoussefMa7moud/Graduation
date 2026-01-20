package com.grad.backend.Auth.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class RegisterResponse {
    private UUID userId;
    private String role;
}
