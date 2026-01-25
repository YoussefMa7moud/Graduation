package com.grad.backend.contracts.dto;

import lombok.Data;

@Data
public class NdaSignRequest {
    private Long submissionId;
    private String signatureBase64;
    private String contractPayloadJson;
}
