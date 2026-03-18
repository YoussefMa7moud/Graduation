package com.grad.backend.Auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    
    // Permissions (null for roles that don't use them)
    private Boolean canViewContracts;
    private Boolean canAddPolicy;
    private Boolean canSignContract;
    private Boolean canAcceptProposals;
}
