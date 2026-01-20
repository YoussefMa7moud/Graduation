package com.grad.backend.Auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class RegisterResponse {
    private Long userId;
    private String role;
}

