package com.grad.backend.project.DTO;

import lombok.Data;

@Data
public class SaveTechnicalDocumentRequest {
    /**
     * JSON object: field element id (e.g. "tde-cover_title") → inner HTML string.
     * Same shape as the technical document editor stores in localStorage.
     */
    private String documentFieldsJson;
}
