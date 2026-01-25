package com.grad.backend.contracts.controller;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.contracts.dto.*;
import com.grad.backend.contracts.service.MainContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts/main")
@RequiredArgsConstructor
public class MainContractController {

    private final MainContractService mainContractService;

    @GetMapping("/parties")
    public ResponseEntity<ContractPartiesResponse> getContractParties(
            @RequestParam Long submissionId,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractPartiesResponse response = mainContractService.getContractParties(submissionId, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    @GetMapping("/draft")
    public ResponseEntity<ContractDraftResponse> getDraft(
            @RequestParam Long submissionId,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractDraftResponse response = mainContractService.getDraft(submissionId, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    @PostMapping("/draft/save")
    public ResponseEntity<ContractDraftResponse> saveDraft(
            @RequestBody SaveContractDraftRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractDraftResponse response = mainContractService.saveDraft(
                    request.getSubmissionId(),
                    user.getId(),
                    request.getContractPayloadJson()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

@PostMapping("/validate/ai")
public ResponseEntity<?> validateWithAI(
        @RequestParam Long submissionId,
        @AuthenticationPrincipal User user
) {
    if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    try {
        ContractValidationResponse response = mainContractService.validateWithAI(submissionId, user.getId());
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        // Return the actual error message so React knows what's up
        Map<String, String> errorBody = Map.of("error", e.getMessage());
        
        if (e.getMessage().contains("Only the assigned company")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorBody);
        }
        
        // If it's a code crash, return 500 or 400
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody);
    }
}

    @PostMapping("/validate/ocl")
    public ResponseEntity<ContractValidationResponse> validateWithOCL(
            @RequestParam Long submissionId,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractValidationResponse response = mainContractService.validateWithOCL(submissionId, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/send-to-client")
    public ResponseEntity<ContractDraftResponse> sendToClient(
            @RequestParam Long submissionId,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractDraftResponse response = mainContractService.sendToClient(submissionId, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/sign/client")
    public ResponseEntity<ContractDraftResponse> signClient(
            @RequestBody ContractSignRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractDraftResponse response = mainContractService.signClient(
                    request.getSubmissionId(),
                    user.getId(),
                    request.getSignatureBase64(),
                    request.getContractPayloadJson()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/sign/company")
    public ResponseEntity<ContractDraftResponse> signCompany(
            @RequestBody ContractSignRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractDraftResponse response = mainContractService.signCompany(
                    request.getSubmissionId(),
                    user.getId(),
                    request.getSignatureBase64(),
                    request.getContractPayloadJson()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/chat/send")
    public ResponseEntity<ContractChatMessageDTO> sendChatMessage(
            @RequestBody SendChatMessageRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ContractChatMessageDTO response = mainContractService.sendChatMessage(
                    request.getSubmissionId(),
                    user.getId(),
                    request.getMessage()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/chat/messages")
    public ResponseEntity<List<ContractChatMessageDTO>> getChatMessages(
            @RequestParam Long submissionId,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            List<ContractChatMessageDTO> messages = mainContractService.getChatMessages(submissionId, user.getId());
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }
}
