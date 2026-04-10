package com.grad.backend.admin.dto;

import lombok.Data;

@Data
public class CreateAdminRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
