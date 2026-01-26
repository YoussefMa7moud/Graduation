package com.grad.backend.Auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.grad.backend.Auth.entity.ClientCompany;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.Auth.repository.CompanyRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final CompanyRepository companyRepository;
    private final ClientCompanyRepository clientCompanyRepository;

    @GetMapping("/company/{id}")
    public ResponseEntity<byte[]> getCompanyLogo(@PathVariable Long id) {

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
    public ResponseEntity<byte[]> getClientCompanyLogo(@PathVariable Long id) {

        ClientCompany clientCompany = clientCompanyRepository.findById(id).orElse(null);

        if (clientCompany == null || clientCompany.getLogo() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(clientCompany.getLogo());
    }

    @PostMapping("/company")
    public ResponseEntity<?> uploadCompanyLogo(
            @AuthenticationPrincipal com.grad.backend.Auth.entity.User user,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        try {
            Company company = companyRepository.findById(user.getId()).orElse(null);
            if (company == null) {
                return ResponseEntity.notFound().build();
            }

            company.setLogo(file.getBytes());
            companyRepository.save(company);

            return ResponseEntity.ok("Logo updated successfully");
        } catch (java.io.IOException e) {
            return ResponseEntity.status(500).body("Error uploading image");
        }
    }
}
