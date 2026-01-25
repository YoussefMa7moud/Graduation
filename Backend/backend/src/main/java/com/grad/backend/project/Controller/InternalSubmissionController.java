package com.grad.backend.project.Controller;

import com.grad.backend.project.service.ProposalSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/internal/submissions")
@RequiredArgsConstructor
public class InternalSubmissionController {

    private final ProposalSubmissionService submissionService;

    @Value("${app.internal.key:}")
    private String internalKey;

    @GetMapping("/{id}/verify-actor")
    public ResponseEntity<Map<String, String>> verifyActor(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestHeader(value = "X-Internal-Key", required = false) String key
    ) {
        if (internalKey == null || internalKey.isEmpty() || !internalKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String actor = submissionService.verifyActor(id, userId);
        return ResponseEntity.ok(Map.of("actor", actor));
    }
}
