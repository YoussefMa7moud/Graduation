package com.grad.backend.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClauseOclConstraintDTO {
    private String clauseId;
    private String sectionTitle;
    private String clauseText;
    private String oclCode;
    private String explanation;
}
