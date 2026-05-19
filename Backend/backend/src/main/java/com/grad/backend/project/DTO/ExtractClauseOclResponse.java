package com.grad.backend.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractClauseOclResponse {
    private List<ClauseOclConstraintDTO> constraints;
    /** JSON stored on company project (versioned bundle). */
    private String oclRulesJson;
}
