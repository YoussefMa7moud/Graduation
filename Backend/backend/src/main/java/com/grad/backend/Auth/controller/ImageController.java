package com.grad.backend.Auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.grad.backend.Auth.entity.ClientCompany;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.Auth.repository.CompanyRepository;

import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final CompanyRepository companyRepository;
    private final ClientCompanyRepository clientCompanyRepository;

    @GetMapping("/company/{id}")
    public ResponseEntity<byte[]> getCompanyLogo(@PathVariable UUID id) {

        Company company = companyRepository.findById(id).orElse(null);

        if (company == null || company.getLogo() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(company.getLogo());
    }

    @GetMapping("/client-company/{id}")
    public ResponseEntity<byte[]> getClientCompanyLogo(@PathVariable UUID id) {

        ClientCompany clientCompany = clientCompanyRepository.findById(id).orElse(null);

        if (clientCompany == null || clientCompany.getLogo() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(clientCompany.getLogo());
    }
}
