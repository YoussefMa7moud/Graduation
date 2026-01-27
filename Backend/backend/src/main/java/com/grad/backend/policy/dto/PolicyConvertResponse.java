package com.grad.backend.policy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyConvertResponse {
    @JsonProperty("explanation")
    private String explanation;
    
    @JsonProperty("oclCode")
    private String oclCode;
    
    @JsonProperty("articleRef")
    private String articleRef;
    
    @JsonProperty("validation")
    private List<ValidationResult> validation;

    @JsonProperty("category")
    private String category;

    @JsonProperty("keywords")
    private List<String> keywords;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationResult {
        @JsonProperty("label")
        private String label;
        
        @JsonProperty("standard")
        private String standard;
    }
}
