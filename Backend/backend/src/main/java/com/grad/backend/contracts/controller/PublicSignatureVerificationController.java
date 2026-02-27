package com.grad.backend.contracts.controller;

import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.ClientPerson;
import com.grad.backend.Auth.entity.ClientCompany;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import com.grad.backend.project.enums.ClientType;

import com.grad.backend.contracts.dto.SignatureVerificationDTO;
import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/signature-verification")
@RequiredArgsConstructor
public class PublicSignatureVerificationController {

    private final ContractRecordRepository contractRecordRepository;
    private final ProposalSubmissionRepository submissionRepository;
    private final ClientPersonRepository clientPersonRepo;
    private final ClientCompanyRepository clientCompanyRepo;

    @GetMapping("/{submissionId}")
    public ResponseEntity<?> verifySignature(
            @PathVariable Long submissionId,
            @RequestParam(required = false) String type) {
        List<ContractRecord> records = contractRecordRepository.findBySubmissionId(submissionId);
        if (records.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ContractRecord record;
        if (type != null && !type.isBlank()) {
            record = records.stream()
                    .filter(r -> type.equalsIgnoreCase(r.getContractType()))
                    .findFirst()
                    .orElse(records.get(0));
        } else {
            // Find MAIN_CONTRACT if exists, otherwise NDA
            record = records.stream()
                    .filter(r -> "MAIN_CONTRACT".equals(r.getContractType()))
                    .findFirst()
                    .orElse(records.get(0));
        }

        ProposalSubmission submission = submissionRepository.findById(submissionId).orElse(null);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }

        // Get Party Names if not in record
        String companyName = record.getCompanySignatoryName();
        if (companyName == null) {
            Company comp = submission.getSoftwareCompany();
            companyName = comp != null ? comp.getName() : "Company";
        }

        String clientName = record.getClientSignatoryName();
        if (clientName == null) {
            if (submission.getClientType() == ClientType.COMPANY) {
                ClientCompany cc = clientCompanyRepo.findById(submission.getClient().getId()).orElse(null);
                clientName = cc != null ? cc.getCompanyName() : "Client";
            } else {
                ClientPerson cp = clientPersonRepo.findById(submission.getClient().getId()).orElse(null);
                clientName = cp != null ? (cp.getFirstName() + " " + cp.getLastName()) : "Client";
            }
        }

        SignatureVerificationDTO dto = SignatureVerificationDTO.builder()
                .submissionId(submissionId)
                .contractTitle(record.getContractType().replace("_", " "))
                .clientName(clientName)
                .clientSignatoryName(record.getClientSignatoryName())
                .clientSignedAt(record.getClientSignedAt())
                .clientSignatureBase64(record.getClientSignatureBase64())
                .companyName(companyName)
                .companySignatoryName(record.getCompanySignatoryName())
                .companySignedAt(record.getSignedAt()) // used as company signed at
                .companySignatureBase64(record.getCompanySignatureBase64())
                .build();

        return ResponseEntity.ok(dto);
    }
}
