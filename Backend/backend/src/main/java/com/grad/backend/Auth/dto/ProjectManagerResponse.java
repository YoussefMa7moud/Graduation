package com.grad.backend.Auth.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProjectManagerResponse {
    private String email;
    private String password;
    private String fullName;
    private Long companyId; 
    
}
