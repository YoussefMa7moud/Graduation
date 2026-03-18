package com.grad.backend.Auth.dto;

import lombok.Data;

@Data
public class CompanyProfileDto {
    private String name;
    private String description;
    private String nationalId;
    private String title;
    private String companyRegNo;
    private String phoneNumber;
}
