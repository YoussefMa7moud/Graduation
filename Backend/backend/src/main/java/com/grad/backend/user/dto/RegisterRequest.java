package com.grad.backend.user.dto;


import lombok.Data;
import org.springframework.web.multipart.MultipartFile;


@Data
public class RegisterRequest {

    private String email;
    private String password;

    // "client" | "company"
    private String role;

    // "individual" | "corporate" (ONLY for client)
    private String clientType;

    private String firstName;
    private String lastName;

    private String companyName;
    private String description;
    
    // File upload for logo (required for all companies)
    // Note: Companies must upload logo as file, not URL
    private MultipartFile logoFile;
}
