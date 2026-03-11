package com.grad.backend.contracts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OclValidationRequest {
    private List<ClauseData> clauses;
    private List<PolicyData> policies;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClauseData {
        private String id;
        private String sectionTitle;
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyData {
        private String id;
        private String text;
        private String oclCode;
        private String keywords;
    }
}
