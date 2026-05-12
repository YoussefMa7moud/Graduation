package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractVerifyResponse {
    private boolean verified;
    private String status;   // "VERIFIED" | "TAMPERED" | "NO_HASH" | "NOT_FOUND"
    private String storedHash;
    private String message;
}
