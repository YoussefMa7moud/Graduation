package com.grad.backend.contracts.dto;

import lombok.Data;

@Data
public class RevealPasswordRequest {
    private String email;
    private String password;
}
