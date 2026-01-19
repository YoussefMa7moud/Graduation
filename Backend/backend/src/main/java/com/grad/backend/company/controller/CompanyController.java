package com.grad.backend.company.controller;

import com.grad.backend.company.entity.SoftwareCompany;
import com.grad.backend.company.repository.SoftwareCompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private SoftwareCompanyRepository repository;

    @GetMapping("/browse")
    public List<SoftwareCompany> getAllCompanies() {
        return repository.findAll();
    }
}