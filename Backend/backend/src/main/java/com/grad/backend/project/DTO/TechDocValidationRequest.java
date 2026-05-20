package com.grad.backend.project.DTO;

import lombok.Data;

@Data
public class TechDocValidationRequest {
    /** Plain text of the technical document (SRS/SDD fields), stripped of HTML on the client. */
    private String documentText;

    /**
     * Optional JSON object of editor fields (id → HTML). When present, the server persists it so the
     * document survives browser changes and can be reloaded as structured JSON.
     */
    private String documentFieldsJson;
}
