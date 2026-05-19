package com.grad.backend.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechDocViolationDTO {
    private String clauseId;
    /** Section or rule label (e.g. COMPENSATION · clause_c3). */
    private String constraintName;
    /** OCL expression from the contract constraint that was violated. */
    private String oclCode;
    /** Plain-language meaning of that OCL constraint. */
    private String oclExplanation;
    /** Why the technical document conflicts with this OCL constraint. */
    private String whyViolated;
    /** Relevant excerpt from the technical document (optional). */
    private String documentConflict;
}
