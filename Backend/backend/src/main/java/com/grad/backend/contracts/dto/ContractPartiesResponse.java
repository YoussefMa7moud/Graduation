package com.grad.backend.contracts.dto;

import com.grad.backend.project.DTO.NdaPartiesDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractPartiesResponse {
    private NdaPartiesDTO partyA; // Company
    private NdaPartiesDTO partyB; // Client
    private String actor; // "client" | "company"
    private String clientType; // "INDIVIDUAL" | "COMPANY"
}
