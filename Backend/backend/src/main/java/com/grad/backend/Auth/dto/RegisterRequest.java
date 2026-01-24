package com.grad.backend.Auth.dto;


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

    // Fields for Software Company
    private String nationalId; // For software company
    private String title; // CEO / CTO / Legal Rep (for software company)
    private String companyRegNo; // For software company and client company
    private String phoneNumber; // For all roles
}
