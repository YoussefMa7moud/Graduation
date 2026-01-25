package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractChatMessageDTO {
    private Long id;
    private Long submissionId;
    private Long senderId;
    private String senderName;
    private String message;
    private LocalDateTime createdAt;
}
