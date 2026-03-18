package com.grad.backend.Auth.controller;

import com.grad.backend.Auth.dto.CompanyProfileDto;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/company/profile")
@RequiredArgsConstructor
public class CompanyProfileController {

    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<CompanyProfileDto> getCompanyProfile(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole().name().equals("COMPANY_EMPLOYEE")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Company> companyOpt = companyRepository.findByUser_Id(currentUser.getId());
        if (companyOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Company company = companyOpt.get();
        CompanyProfileDto dto = new CompanyProfileDto();
        dto.setName(company.getName());
        dto.setDescription(company.getDescription());
        dto.setNationalId(company.getNationalId());
        dto.setTitle(company.getTitle());
        dto.setCompanyRegNo(company.getCompanyRegNo());
        dto.setPhoneNumber(company.getPhoneNumber());

        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<CompanyProfileDto> updateCompanyProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CompanyProfileDto dto) {
        
        if (currentUser.getRole().name().equals("COMPANY_EMPLOYEE")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Company> companyOpt = companyRepository.findByUser_Id(currentUser.getId());
        if (companyOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Company company = companyOpt.get();
        company.setName(dto.getName());
        company.setDescription(dto.getDescription());
        company.setNationalId(dto.getNationalId());
        company.setTitle(dto.getTitle());
        company.setCompanyRegNo(dto.getCompanyRegNo());
        company.setPhoneNumber(dto.getPhoneNumber());

        companyRepository.save(company);

        return ResponseEntity.ok(dto);
    }
}
