package com.grad.backend.project.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.grad.backend.project.DTO.TechDocValidationRequest;
import com.grad.backend.project.DTO.TechDocValidationResponse;
import com.grad.backend.project.DTO.TechDocViolationDTO;
import com.grad.backend.project.DTO.ai.AiSingleConstraintCheckDTO;
import com.grad.backend.project.entity.CompanyProject;
import com.grad.backend.project.repository.CompanyProjectRepository;
import com.grad.backend.service.GroqApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectTechDocValidationService {

    /** Per-chunk size when scanning a very long document. */
    private static final int CHUNK_SIZE = 14_000;
    private static final int CHUNK_OVERLAP = 2_000;
    private static final int MAX_TOTAL_DOC_CHARS = 120_000;

    private final CompanyProjectRepository companyProjectRepository;
    private final GroqApiClient groqApiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public TechDocValidationResponse validate(Long projectId, Long pmUserId, TechDocValidationRequest request) {
        String documentText = request != null ? request.getDocumentText() : null;
        String documentFieldsJson = request != null ? request.getDocumentFieldsJson() : null;

        CompanyProject project = companyProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getProjectManager().getId().equals(pmUserId)) {
            throw new RuntimeException("Unauthorized");
        }

        TechDocValidationResponse response;

        String oclRules = project.getOclRules();
        if (oclRules == null || oclRules.isBlank()) {
            response = TechDocValidationResponse.builder()
                    .valid(false)
                    .violations(List.of(systemViolation(
                            "Setup",
                            "No OCL constraints are stored for this project. Re-assign the contract with clause OCL extraction, or contact the company.")))
                    .build();
            persistTechDocAfterValidation(project, documentFieldsJson, response);
            return response;
        }

        String doc = documentText == null ? "" : documentText.trim();
        if (doc.isBlank()) {
            response = TechDocValidationResponse.builder()
                    .valid(false)
                    .violations(List.of(systemViolation(
                            "Document",
                            "The technical document is empty. Open the Document Editor, fill in the sections, save, then run validation again.")))
                    .build();
            persistTechDocAfterValidation(project, documentFieldsJson, response);
            return response;
        }

        if (doc.length() > MAX_TOTAL_DOC_CHARS) {
            doc = doc.substring(0, MAX_TOTAL_DOC_CHARS) + "\n\n[... document truncated for validation ...]";
        }

        if (!groqApiClient.isConfigured()) {
            throw new IllegalStateException("AI service is not configured (missing GROQ_API_KEY)");
        }

        List<BundleConstraint> constraints = loadConstraints(oclRules);
        if (constraints.isEmpty()) {
            response = TechDocValidationResponse.builder()
                    .valid(false)
                    .violations(List.of(systemViolation(
                            "Setup",
                            "No parseable OCL constraints found in this project.")))
                    .build();
            persistTechDocAfterValidation(project, documentFieldsJson, response);
            return response;
        }

        List<String> docChunks = splitIntoOverlappingChunks(doc);
        List<TechDocViolationDTO> violations = new ArrayList<>();
        Set<String> seenClauseIds = new LinkedHashSet<>();

        try {
            for (BundleConstraint constraint : constraints) {
                TechDocViolationDTO found = checkConstraintAcrossChunks(constraint, docChunks);
                if (found != null) {
                    String dedupeKey = found.getClauseId() != null ? found.getClauseId() : found.getConstraintName();
                    if (seenClauseIds.add(dedupeKey)) {
                        violations.add(found);
                    }
                }
            }

            response = TechDocValidationResponse.builder()
                    .valid(violations.isEmpty())
                    .violations(violations)
                    .build();
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Tech doc validation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to validate technical document: " + e.getMessage(), e);
        }

        persistTechDocAfterValidation(project, documentFieldsJson, response);
        return response;
    }

    /**
     * Stores the structured document as JSON when provided, and when validation reports violations
     * stores a JSON snapshot of the outcome for traceability while the PM iterates on fixes.
     */
    private void persistTechDocAfterValidation(
            CompanyProject project,
            String documentFieldsJson,
            TechDocValidationResponse response) {
        try {
            if (documentFieldsJson != null && !documentFieldsJson.isBlank()) {
                project.setTechnicalDocumentJson(
                        CompanyProjectService.normalizeDocumentFieldsJson(documentFieldsJson));
            }
            if (!response.isValid()) {
                ObjectNode meta = objectMapper.createObjectNode();
                meta.put("validatedAt", Instant.now().toString());
                meta.put("valid", false);
                meta.set("violations", objectMapper.valueToTree(response.getViolations()));
                project.setTechnicalDocumentValidationJson(objectMapper.writeValueAsString(meta));
            } else {
                project.setTechnicalDocumentValidationJson(null);
            }
            companyProjectRepository.save(project);
        } catch (Exception e) {
            log.warn("Could not persist technical document / validation JSON: {}", e.getMessage());
        }
    }

    private TechDocViolationDTO checkConstraintAcrossChunks(BundleConstraint constraint, List<String> docChunks) {
        TechDocViolationDTO best = null;
        for (int i = 0; i < docChunks.size(); i++) {
            String chunk = docChunks.get(i);
            String chunkLabel = docChunks.size() > 1
                    ? " (document part " + (i + 1) + " of " + docChunks.size() + ")"
                    : "";

            AiSingleConstraintCheckDTO result = checkOneConstraint(constraint, chunk, chunkLabel);
            if (Boolean.TRUE.equals(result.getViolated())) {
                String displayName = constraint.sectionTitle != null ? constraint.sectionTitle : "Constraint";
                if (constraint.clauseId != null && !constraint.clauseId.isBlank()) {
                    displayName = displayName + " · " + constraint.clauseId;
                }
                best = TechDocViolationDTO.builder()
                        .clauseId(constraint.clauseId)
                        .constraintName(displayName)
                        .oclCode(constraint.oclCode)
                        .oclExplanation(constraint.explanation)
                        .whyViolated(result.getWhyViolated() != null ? result.getWhyViolated().trim() : "Conflicts with this OCL constraint.")
                        .documentConflict(blankToNull(result.getDocumentConflict()))
                        .build();
                break;
            }
        }
        return best;
    }

    private AiSingleConstraintCheckDTO checkOneConstraint(
            BundleConstraint constraint,
            String documentChunk,
            String chunkLabel) {
        String constraintJson;
        try {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("clauseId", constraint.clauseId != null ? constraint.clauseId : "");
            node.put("sectionTitle", constraint.sectionTitle != null ? constraint.sectionTitle : "");
            node.put("oclCode", constraint.oclCode);
            node.put("explanation", constraint.explanation != null ? constraint.explanation : "");
            constraintJson = objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            constraintJson = constraint.oclCode;
        }

        boolean confidentiality = isConfidentialityConstraint(constraint);
        String userPrompt = buildCheckPrompt(constraintJson, documentChunk, chunkLabel, confidentiality);

        try {
            String systemMsg = confidentiality
                    ? "You enforce confidentiality and non-disclosure rules in technical documents. "
                            + "Detailed sensitive business data in an SRS can be unlawful disclosure. Output only JSON."
                    : "You detect when a technical document breaks an OCL rule (contradiction or forbidden content). "
                            + "Scan long paragraphs carefully. Output only JSON.";

            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", systemMsg),
                    Map.of("role", "user", "content", userPrompt));

            String content = groqApiClient.chatCompletion(messages, 0.1, confidentiality ? 3072 : 2048, true);
            String json = TaskGenerationAiService.extractJson(content);
            AiSingleConstraintCheckDTO parsed = objectMapper.readValue(json, AiSingleConstraintCheckDTO.class);
            if (parsed.getViolated() == null) {
                parsed.setViolated(false);
            }
            if (confidentiality
                    && !Boolean.TRUE.equals(parsed.getViolated())
                    && looksLikeUndisclosedSensitiveContent(documentChunk)) {
                parsed.setViolated(true);
                parsed.setWhyViolated(
                        "The technical document lists specific sensitive business data (e.g. sales, salaries, "
                                + "customer or payment records, supplier information) which constitutes disclosure "
                                + "of confidential project information without indicating written consent or "
                                + "authorized access controls required by the confidentiality constraint.");
                if (parsed.getDocumentConflict() == null || parsed.getDocumentConflict().isBlank()) {
                    parsed.setDocumentConflict(extractSensitiveSnippet(documentChunk));
                }
            }
            return parsed;
        } catch (Exception e) {
            log.warn("Constraint check failed for {}: {}", constraint.clauseId, e.getMessage());
            AiSingleConstraintCheckDTO fallback = new AiSingleConstraintCheckDTO();
            fallback.setViolated(false);
            return fallback;
        }
    }

    private static boolean isConfidentialityConstraint(BundleConstraint constraint) {
        String blob = ((constraint.sectionTitle != null ? constraint.sectionTitle : "") + " "
                + (constraint.explanation != null ? constraint.explanation : "") + " "
                + (constraint.oclCode != null ? constraint.oclCode : "")).toLowerCase(Locale.ROOT);
        return blob.contains("confidential")
                || blob.contains("non-disclosure")
                || blob.contains("nondisclosure")
                || blob.contains(" nda")
                || blob.contains("disclose")
                || blob.contains("disclosure")
                || blob.contains("without written consent")
                || blob.contains("trade secret");
    }

    private static String buildCheckPrompt(
            String constraintJson,
            String documentChunk,
            String chunkLabel,
            boolean confidentiality) {
        String sharedHeader = """
                Read the ENTIRE technical document below, including long paragraphs.

                OCL constraint (JSON):
                """
                + constraintJson
                + "\n\nTechnical document"
                + chunkLabel
                + ":\n\n"
                + documentChunk;

        if (confidentiality) {
            return sharedHeader
                    + """

                    This is a CONFIDENTIALITY / NON-DISCLOSURE constraint.

                    Report violated=true if ANY of the following apply:
                    1. The document includes specific non-public business or project details that amount to DISCLOSING
                       confidential information (e.g. internal sales records, supplier contracts, customer databases,
                       employee salaries, financial reports, customer contact details, payment transaction records,
                       supplier pricing, proprietary processes) — even when framed as "system features" or integrations.
                    2. The document contradicts the obligation (e.g. shares data openly when the rule forbids disclosure without written consent).
                    3. Sensitive operational or client-specific data appears in the SRS without stating written consent,
                       authorization, redaction, need-to-know access, or equivalent controls required by the constraint.

                    Report violated=false ONLY if:
                    - The document is silent or uses only generic high-level wording (no sensitive specifics), OR
                    - Sensitive topics are mentioned only with explicit consent/authorization/access-control language aligned with the constraint.

                    Do NOT require a numeric mismatch. Listing detailed confidential business data in the SRS can be a violation by itself.

                    Return ONLY JSON:
                    { "violated": true or false, "whyViolated": "...", "documentConflict": "quote from document if violated" }
                    """;
        }

        return sharedHeader
                + """

                Report violated=true if the document:
                1. Explicitly states something that contradicts the constraint (wrong number, opposite obligation, forbidden value), OR
                2. Describes behavior, requirements, or data handling that the constraint forbids.

                Report violated=false if the document is silent on the topic or only vague/generic (do not flag missing coverage).

                Return ONLY JSON:
                { "violated": true or false, "whyViolated": "...", "documentConflict": "quote from document if violated" }
                """;
    }

    private static boolean looksLikeUndisclosedSensitiveContent(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        String lower = text.toLowerCase(Locale.ROOT);
        if (containsAny(lower, "written consent", "written approval", "authorized disclosure",
                "authorised disclosure", "need-to-know", "need to know", "under nda", "confidentiality agreement")) {
            return false;
        }
        int hits = 0;
        if (containsAny(lower, "salary", "salaries", "payroll")) hits++;
        if (containsAny(lower, "customer database", "customer contact", "customer data", "client data")) hits++;
        if (containsAny(lower, "payment transaction", "payment record", "transaction record")) hits++;
        if (containsAny(lower, "supplier contract", "supplier pricing", "vendor contract")) hits++;
        if (containsAny(lower, "financial report", "sales record", "internal sales", "revenue")) hits++;
        if (containsAny(lower, "employee salary", "staff salary")) hits++;
        return hits >= 2;
    }

    private static boolean containsAny(String text, String... needles) {
        for (String n : needles) {
            if (text.contains(n)) {
                return true;
            }
        }
        return false;
    }

    private static String extractSensitiveSnippet(String text) {
        if (text == null) {
            return "";
        }
        int max = Math.min(400, text.length());
        String snippet = text.substring(0, max).trim();
        if (text.length() > max) {
            snippet += "…";
        }
        return snippet;
    }

    private static List<String> splitIntoOverlappingChunks(String doc) {
        List<String> chunks = new ArrayList<>();
        if (doc.length() <= CHUNK_SIZE) {
            chunks.add(doc);
            return chunks;
        }
        int start = 0;
        while (start < doc.length()) {
            int end = Math.min(start + CHUNK_SIZE, doc.length());
            if (end < doc.length()) {
                int breakAt = doc.lastIndexOf('\n', end);
                if (breakAt > start + CHUNK_SIZE / 2) {
                    end = breakAt;
                }
            }
            chunks.add(doc.substring(start, end));
            if (end >= doc.length()) {
                break;
            }
            start = Math.max(end - CHUNK_OVERLAP, start + 1);
        }
        return chunks;
    }

    private List<BundleConstraint> loadConstraints(String oclRules) {
        List<BundleConstraint> list = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(oclRules);
            if (!root.isObject() || !root.has("constraints") || !root.get("constraints").isArray()) {
                return list;
            }
            for (JsonNode c : root.get("constraints")) {
                String oclCode = c.path("oclCode").asText(null);
                if (oclCode == null || oclCode.isBlank()) {
                    continue;
                }
                list.add(new BundleConstraint(
                        c.path("clauseId").asText(null),
                        c.path("sectionTitle").asText(null),
                        oclCode,
                        c.path("explanation").asText(null)));
            }
        } catch (Exception e) {
            log.debug("Could not load OCL bundle constraints: {}", e.getMessage());
        }
        return list;
    }

    private static TechDocViolationDTO systemViolation(String name, String why) {
        return TechDocViolationDTO.builder()
                .constraintName(name)
                .whyViolated(why)
                .build();
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private record BundleConstraint(
            String clauseId,
            String sectionTitle,
            String oclCode,
            String explanation) {}
}
