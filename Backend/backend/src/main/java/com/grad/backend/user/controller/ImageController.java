package com.grad.backend.user.controller;

import com.grad.backend.user.entity.ClientCompany;
import com.grad.backend.user.entity.Company;
import com.grad.backend.user.repository.ClientCompanyRepository;
import com.grad.backend.user.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        // TODO: Determine the content type dynamically if possible
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(company.getLogo());
    }

    @GetMapping("/client-company/{id}")
    public ResponseEntity<byte[]> getClientCompanyLogo(@PathVariable Long id) {
        ClientCompany clientCompany = clientCompanyRepository.findById(id).orElse(null);
        if (clientCompany == null || clientCompany.getLogo() == null) {
            return ResponseEntity.notFound().build();
        }
        // TODO: Determine the content type dynamically if possible
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(clientCompany.getLogo());
    }
}
