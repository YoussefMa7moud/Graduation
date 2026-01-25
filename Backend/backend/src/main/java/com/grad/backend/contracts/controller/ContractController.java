package com.grad.backend.contracts.controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.contracts.dto.ContractRecordResponse;
import com.grad.backend.contracts.dto.NdaDraftResponse;
import com.grad.backend.contracts.dto.NdaSignRequest;
import com.grad.backend.contracts.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping("/nda/draft")
    public ResponseEntity<NdaDraftResponse> getNdaDraft(
            @RequestParam Long submissionId,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            NdaDraftResponse r = contractService.getDraft(submissionId, user.getId());
            return ResponseEntity.ok(r);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    @PostMapping("/nda/sign/client")
    public ResponseEntity<NdaDraftResponse> signClient(
            @RequestBody NdaSignRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            NdaDraftResponse r = contractService.signClient(
                    request.getSubmissionId(),
                    user.getId(),
                    request.getSignatureBase64(),
                    request.getContractPayloadJson()
            );
            return ResponseEntity.ok(r);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/nda/sign/company")
    public ResponseEntity<NdaDraftResponse> signCompany(
            @RequestBody NdaSignRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            NdaDraftResponse r = contractService.signCompany(
                    request.getSubmissionId(),
                    user.getId(),
                    request.getSignatureBase64(),
                    request.getContractPayloadJson()
            );
            return ResponseEntity.ok(r);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/records")
    public ResponseEntity<List<ContractRecordResponse>> listRecords(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<ContractRecordResponse> list = contractService.listRecordsByCompany(user.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping(value = "/records/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getRecordPdf(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        byte[] pdf = contractService.getPdfByIdAndCompany(id, user.getId());
        if (pdf == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(pdf);
    }
}
