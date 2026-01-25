package com.grad.backend.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NdaPartiesDTO {
    private String name;
    private String signatory;
    private String title;
    private String email;
    private String details;
}
