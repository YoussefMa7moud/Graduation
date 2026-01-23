package com.grad.backend.Auth.dto;
import lombok.Data;

@Data
public class ProjectManagerRequest {
    private String email;
    private String password;
    private String fullName;
    private Long companyId;    
}
