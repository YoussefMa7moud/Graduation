package com.grad.backend.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NdaPartiesResponse {
    private NdaPartiesDTO partyA;
    private NdaPartiesDTO partyB;
    private String actor; // "client" | "company" for who is viewing
}
