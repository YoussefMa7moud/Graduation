package com.grad.backend.project.DTO.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.grad.backend.project.DTO.TechDocViolationDTO;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiTechDocValidationDTO {
    private Boolean valid;
    private List<AiViolationItem> violations;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AiViolationItem {
        /** Must match clauseId from the OCL bundle when possible. */
        private String clauseId;
        private String constraintName;
        private String whyViolated;
        private String validationExplanation;
        private String documentConflict;
        private String ruleLabel;
        private String message;
    }

    public List<TechDocViolationDTO> toViolationDtos() {
        if (violations == null || violations.isEmpty()) {
            return new ArrayList<>();
        }
        List<TechDocViolationDTO> out = new ArrayList<>();
        for (AiViolationItem v : violations) {
            if (v == null) {
                continue;
            }
            String why = firstNonBlank(v.getWhyViolated(), v.getValidationExplanation(), v.getMessage());
            if (why == null || why.isBlank()) {
                continue;
            }
            out.add(TechDocViolationDTO.builder()
                    .clauseId(blankToNull(v.getClauseId()))
                    .constraintName(firstNonBlank(v.getConstraintName(), v.getRuleLabel(), "Constraint"))
                    .whyViolated(why.trim())
                    .documentConflict(blankToNull(v.getDocumentConflict()))
                    .build());
        }
        return out;
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
