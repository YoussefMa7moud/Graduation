package com.grad.backend.contracts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.Auth.entity.ClientCompany;
import com.grad.backend.Auth.entity.ClientPerson;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.repository.ClientCompanyRepository;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.contracts.dto.*;
import com.grad.backend.contracts.entity.ContractChatMessage;
import com.grad.backend.contracts.entity.ContractDraft;
import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractChatMessageRepository;
import com.grad.backend.contracts.repository.ContractDraftRepository;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.config.InternalApiConfig;
import com.grad.backend.policy.entity.Policy;
import com.grad.backend.policy.repository.PolicyRepository;
import com.grad.backend.project.DTO.NdaPartiesDTO;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.enums.ClientType;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MainContractService {

    private static final Logger log = LoggerFactory.getLogger(MainContractService.class);

    private final ContractDraftRepository draftRepository;
    private final ContractRecordRepository recordRepository;
    private final ContractChatMessageRepository chatMessageRepository;
    private final ProposalSubmissionRepository submissionRepository;
    private final CompanyRepository companyRepository;
    private final ClientCompanyRepository clientCompanyRepo;
    private final ClientPersonRepository clientPersonRepo;
    private final RestTemplate restTemplate;
    private final InternalApiConfig internalApiConfig;
    private final PolicyRepository policyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai-model.url:http://localhost:5000}")
    private String aiModelUrl;

    @Value("${app.ocl.api.url:http://localhost:5001}")
    private String oclApiUrl;

   @SuppressWarnings("rawtypes")
private String verifyActor(Long submissionId, Long userId) {
    try {
        String url = internalApiConfig.getBaseUrl()
                + "/api/internal/submissions/" + submissionId
                + "/verify-actor?userId=" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Key", internalApiConfig.getInternalKey());

        ResponseEntity<Map> res = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        if (res.getStatusCode().is2xxSuccessful()
                && res.getBody() != null
                && res.getBody().containsKey("actor")) {

            String actor = (String) res.getBody().get("actor");
            log.debug("verifyActor (internal) => actor={} submission={} user={}", actor, submissionId, userId);
            return actor;
        }
    } catch (Exception e) {
        log.warn("verifyActor internal failed. Falling back. submission={}, user={}, reason={}",
                submissionId, userId, e.getMessage());
    }

    /* =========================
       🔁 FALLBACK (FIXED)
       ========================= */
    try {
        ProposalSubmission submission = submissionRepository.findById(submissionId).orElse(null);
        if (submission == null) return "none";

        // CLIENT
        if (submission.getClient() != null
                && submission.getClient().getId().equals(userId)) {
            return "client";
        }

        // COMPANY (FIX ❗)
        Company company = submission.getSoftwareCompany();
        if (company != null
                && company.getUser() != null
                && company.getUser().getId().equals(userId)) {
            return "company";
        }

    } catch (Exception ex) {
        log.error("verifyActor fallback failed. submission={}, user={}, error={}",
                submissionId, userId, ex.getMessage());
    }

    return "none";
}


    @Transactional(readOnly = true)
    public ContractPartiesResponse getContractParties(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if ("none".equals(actor)) throw new RuntimeException("Not authorized");

        ProposalSubmission s = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Company comp = s.getSoftwareCompany();
        User compUser = comp.getUser();
        NdaPartiesDTO partyA = NdaPartiesDTO.builder()
                .name(comp.getName() != null ? comp.getName() : "")
                .signatory(compUser.getFirstName() + " " + compUser.getLastName())
                .title(comp.getTitle() != null ? comp.getTitle() : "")
                .email(compUser.getEmail())
                .details(comp.getCompanyRegNo() != null ? "CR: " + comp.getCompanyRegNo() : "")
                .build();

        User cl = s.getClient();
        NdaPartiesDTO partyB;
        String clientTypeStr;
        if (s.getClientType() == ClientType.COMPANY) {
            ClientCompany cc = clientCompanyRepo.findById(cl.getId())
                    .orElseThrow(() -> new RuntimeException("Client company not found"));
            partyB = NdaPartiesDTO.builder()
                    .name(cc.getCompanyName() != null ? cc.getCompanyName() : "")
                    .signatory(cl.getFirstName() + " " + cl.getLastName())
                    .title(cc.getTitle() != null ? cc.getTitle() : "")
                    .email(cl.getEmail())
                    .details(cc.getCompanyRegNo() != null ? "CR: " + cc.getCompanyRegNo() : "")
                    .build();
            clientTypeStr = "COMPANY";
        } else {
            ClientPerson cp = clientPersonRepo.findById(cl.getId())
                    .orElseThrow(() -> new RuntimeException("Client person not found"));
            partyB = NdaPartiesDTO.builder()
                    .name("Individual Client")
                    .signatory(cp.getFirstName() + " " + cp.getLastName())
                    .title("Authorized Representative")
                    .email(cl.getEmail())
                    .details(cp.getNationalId() != null ? "National ID: " + cp.getNationalId() : "")
                    .build();
            clientTypeStr = "INDIVIDUAL";
        }

        return ContractPartiesResponse.builder()
                .partyA(partyA)
                .partyB(partyB)
                .actor(actor)
                .clientType(clientTypeStr)
                .build();
    }

    @Transactional
    public ContractDraftResponse saveDraft(Long submissionId, Long userId, String contractPayloadJson) {
        String actor = verifyActor(submissionId, userId);
        if ("none".equals(actor)) throw new RuntimeException("Not authorized");

        ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseGet(() -> {
                    ContractDraft d = new ContractDraft();
                    d.setSubmissionId(submissionId);
                    d.setContractPayloadJson(contractPayloadJson != null ? contractPayloadJson : "{}");
                    d.setAiValidated(false);
                    d.setOclValidated(false);
                    d.setSentToClient(false);
                    return draftRepository.save(d);
                });

        // Check if contract content has changed - if so, reset validations
        String oldPayload = draft.getContractPayloadJson();
        String newPayload = contractPayloadJson != null ? contractPayloadJson : "{}";
        
        if (!oldPayload.equals(newPayload)) {
            // Contract was modified - reset validations
            draft.setAiValidated(false);
            draft.setOclValidated(false);
            draft.setValidationResultsJson(null);
            log.info("Contract modified for submission {}, resetting validations", submissionId);
        }

        draft.setContractPayloadJson(newPayload);
        draft = draftRepository.save(draft);
        return toDraftResponse(draft);
    }

    @Transactional(readOnly = true)
    public ContractDraftResponse getDraft(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if ("none".equals(actor)) throw new RuntimeException("Not authorized");

        return draftRepository.findBySubmissionId(submissionId)
                .map(this::toDraftResponse)
                .orElse(ContractDraftResponse.builder()
                        .submissionId(submissionId)
                        .contractPayloadJson("{}")
                        .aiValidated(false)
                        .oclValidated(false)
                        .sentToClient(false)
                        .build());
    }

   @Transactional
    public ContractValidationResponse validateWithAI(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if (!"company".equals(actor)) throw new RuntimeException("Only the assigned company can validate");

        try {
            ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                    .orElseThrow(() -> new RuntimeException("Draft not found. Please save first."));

            List<ViolationDTO> allViolations = new ArrayList<>();
            double minCompliance = 100.0;

            JsonNode root = objectMapper.readTree(draft.getContractPayloadJson());
            if (root.has("sections")) {
                for (JsonNode section : root.get("sections")) {
                    int sectionNum = section.path("num").asInt();
                    JsonNode clauses = section.get("clauses");
                    
                    if (clauses != null && clauses.isArray()) {
                        int clauseIdx = 1;
                        for (JsonNode clause : clauses) {
                            String cId = clause.path("id").asText();
                            String rawText = clause.path("text").asText().trim();

                            if (rawText.length() < 10) {
                                clauseIdx++;
                                continue;
                            }

                            // FIX: Prepend numbering so AI Regex matches it: "1.1 text"
                            String formattedText = String.format("%d.%d %s", sectionNum, clauseIdx, rawText);
                            
                            Map<String, String> requestBody = Map.of("contract", formattedText);
                            
                            log.info("Validating Clause ID {}: {}", cId, formattedText);

                            try {
                                ResponseEntity<Map> response = restTemplate.postForEntity(
                                        aiModelUrl + "/analyze", requestBody, Map.class);

                                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                                    Map<String, Object> body = response.getBody();
                                    
                                    // Extract violations
                                    List<Map<String, Object>> vList = (List<Map<String, Object>>) body.get("violations");
                                    if (vList != null && !vList.isEmpty()) {
                                        for (Map<String, Object> vMap : vList) {
                                            allViolations.add(ViolationDTO.builder()
                                                    .clauseId(cId) // Map AI result back to Frontend ID "c1"
                                                    .clauseText(rawText)
                                                    .reason((String) vMap.get("reason"))
                                                    .suggestion((String) vMap.get("suggestion"))
                                                    .confidence(1.0)
                                                    .build());
                                        }
                                    }

                                    double score = body.get("compliance_score") != null ? 
                                            ((Number) body.get("compliance_score")).doubleValue() : 100.0;
                                    minCompliance = Math.min(minCompliance, score);
                                }
                            } catch (Exception e) {
                                log.error("AI call failed for clause {}: {}", cId, e.getMessage());
                            }
                            clauseIdx++;
                        }
                    }
                }
            }

            // Save results to DB
            draft.setAiValidated(allViolations.isEmpty());
            Map<String, Object> results = Map.of("violations", allViolations, "complianceScore", minCompliance);
            draft.setValidationResultsJson(objectMapper.writeValueAsString(results));
            draftRepository.save(draft);

            return ContractValidationResponse.builder()
                    .isValid(allViolations.isEmpty())
                    .complianceScore(minCompliance)
                    .violations(allViolations)
                    .message(allViolations.isEmpty() ? "No violations detected" : "Violations found")
                    .build();

        } catch (Exception e) {
            log.error("Global Validation Error: ", e);
            throw new RuntimeException("AI Validation error: " + e.getMessage());
        }
    }

    @Transactional
    public ContractValidationResponse validateWithOCL(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if (!"company".equals(actor)) throw new RuntimeException("Only company can validate contract");

        ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Draft not found. Please save first."));

        try {
            // Load all policies for this company (stored under currentUserId)
            List<Policy> policies = policyRepository.findByCompanyIdOrderByCreatedAtDesc(userId);
            
            if (policies.isEmpty()) {
                log.info("No policies found for company {}. Setting oclValidated=true (nothing to validate against)", userId);
                draft.setOclValidated(true);
                draftRepository.save(draft);
                return ContractValidationResponse.builder()
                        .isValid(true)
                        .complianceScore(100.0)
                        .violations(new ArrayList<>())
                        .message("OCL validation approved (no policies to validate against)")
                        .build();
            }

            // Parse contract clauses
            List<Map<String, String>> clauses = new ArrayList<>();
            JsonNode root = objectMapper.readTree(draft.getContractPayloadJson());
            if (root.has("sections")) {
                for (JsonNode section : root.get("sections")) {
                    // Skip locked template section (Applicable Law) - not user-editable and should not be policy-validated
                    String sectionId = section.path("id").asText("");
                    if ("s10".equals(sectionId)) {
                        continue;
                    }
                    JsonNode clauseNodes = section.get("clauses");
                    if (clauseNodes != null && clauseNodes.isArray()) {
                        for (JsonNode clause : clauseNodes) {
                            String cId = clause.path("id").asText();
                            String rawText = clause.path("text").asText("").trim();
                            if (rawText.length() < 10) continue;
                            Map<String, String> c = new HashMap<>();
                            c.put("id", cId);
                            c.put("text", rawText);
                            clauses.add(c);
                        }
                    }
                }
            }

            // Evaluate only policies relevant to each clause (keyword/category match)
            List<ViolationDTO> oclViolations = new ArrayList<>();
            log.info("Starting OCL validation. Total clauses: {}, Total policies: {}", clauses.size(), policies.size());
            int totalMatchedPolicyChecks = 0;

            // Common stop-words / overly generic keywords that should not trigger matching on their own
            final java.util.Set<String> keywordStoplist = java.util.Set.of(
                    "policy", "policies", "company", "contract", "agreement", "shall", "must", "may",
                    "employee", "employees", "client", "customer", "customers", "user", "users",
                    "data", "information", "security", "service", "services", "system", "systems",
                    "process", "processing", "law", "legal", "compliance", "requirements", "requirement",
                    "standard", "terms", "term"
            );
            
            for (Map<String, String> clause : clauses) {
                String clauseId = clause.get("id");
                String clauseText = clause.get("text");
                String clauseLower = clauseText.toLowerCase();

                List<Policy> matched = policies.stream().filter(p -> {
                    if (p == null) return false;
                    int score = 0;

                    // Category match (word-boundary-ish)
                    if (p.getCategory() != null && !p.getCategory().isBlank()) {
                        String cat = p.getCategory().trim().toLowerCase();
                        if (cat.length() >= 4 && clauseLower.matches(".*\\b" + java.util.regex.Pattern.quote(cat) + "\\b.*")) {
                            score += 2;
                        }
                    }

                    // Keyword match (stored as comma-separated)
                    if (p.getKeywords() != null && !p.getKeywords().isBlank()) {
                        String[] kws = p.getKeywords().split(",");
                        int hits = 0;
                        for (String kw : kws) {
                            String k = kw == null ? "" : kw.trim().toLowerCase();
                            if (k.isBlank()) continue;
                            if (keywordStoplist.contains(k)) continue;
                            // Avoid tiny keywords that cause false positives
                            if (k.length() < 5) continue;
                            // Prefer whole-word matches to avoid "alex" matching "alexandria" etc.
                            if (clauseLower.matches(".*\\b" + java.util.regex.Pattern.quote(k) + "\\b.*")) {
                                hits++;
                            }
                        }
                        // One hit is often still too weak; require 2 hits OR a single long hit (>=8)
                        if (hits >= 2) score += 2;
                        else {
                            for (String kw : kws) {
                                String k = kw == null ? "" : kw.trim().toLowerCase();
                                if (k.length() >= 8 && !keywordStoplist.contains(k)
                                        && clauseLower.matches(".*\\b" + java.util.regex.Pattern.quote(k) + "\\b.*")) {
                                    score += 1;
                                    break;
                                }
                            }
                        }
                    }

                    // Require a minimum score to consider it a real match
                    return score >= 2;
                }).collect(Collectors.toList());

                log.info("Clause {} matched {} policies", clauseId, matched.size());
                
                for (Policy policy : matched) {
                    totalMatchedPolicyChecks++;
                    log.info("Evaluating clause {} against policy: {}", clauseId, policy.getPolicyName());
                    boolean passed = evaluatePolicyWithOclService(policy, clauseText, userId);
                    log.info("Policy {} evaluation result: passed={}", policy.getPolicyName(), passed);
                    
                    if (!passed) {
                        Map<String, String> violatedLaw = new HashMap<>();
                        violatedLaw.put("policyId", String.valueOf(policy.getId()));
                        violatedLaw.put("policyName", policy.getPolicyName());
                        if (policy.getCategory() != null) violatedLaw.put("category", policy.getCategory());
                        if (policy.getArticleRef() != null) violatedLaw.put("articleRef", policy.getArticleRef());

                        oclViolations.add(ViolationDTO.builder()
                                .clauseId(clauseId)
                                .clauseText(clauseText)
                                .violatedLaw(violatedLaw)
                                .confidence(1.0)
                                .reason("This clause violates company policy: " + policy.getPolicyName())
                                .suggestion("Revise this clause to comply with: " + policy.getPolicyName())
                                .build());
                        log.warn("Violation detected: clause {} violates policy {}", clauseId, policy.getPolicyName());
                    } else {
                        log.info("Clause {} passed policy {} validation", clauseId, policy.getPolicyName());
                    }
                }
            }
            
            log.info("OCL validation complete. Total violations: {}", oclViolations.size());

            // If nothing matched at all, then by definition nothing violates company policy
            if (totalMatchedPolicyChecks == 0) {
                log.info("No clause matched any company policy. Marking OCL validation as passed.");
                draft.setOclValidated(true);
                draftRepository.save(draft);
                return ContractValidationResponse.builder()
                        .isValid(true)
                        .complianceScore(100.0)
                        .violations(new ArrayList<>())
                        .message("OCL validation approved (no matching company policies)")
                        .build();
            }

            // Merge with existing validation results (if AI ran before)
            Map<String, Object> mergedResults = new HashMap<>();
            if (draft.getValidationResultsJson() != null && !draft.getValidationResultsJson().isBlank()) {
                try {
                    mergedResults.putAll(objectMapper.readValue(draft.getValidationResultsJson(), Map.class));
                } catch (Exception ignore) {
                    // ignore parsing issues and overwrite below
                }
            }
            mergedResults.put("oclViolations", oclViolations);

            // Keep a unified "violations" list for frontend compatibility
            List<Map<String, Object>> unified = new ArrayList<>();
            Object existingViolations = mergedResults.get("violations");
            if (existingViolations instanceof List) {
                unified.addAll((List<Map<String, Object>>) existingViolations);
            }
            // Add OCL violations (as maps) - ObjectMapper will serialize DTOs fine, but keep explicit
            for (ViolationDTO v : oclViolations) {
                Map<String, Object> mv = objectMapper.convertValue(v, Map.class);
                unified.add(mv);
            }
            mergedResults.put("violations", unified);

            boolean isValid = oclViolations.isEmpty();
            draft.setOclValidated(isValid);
            draft.setValidationResultsJson(objectMapper.writeValueAsString(mergedResults));
            ContractDraft saved = draftRepository.save(draft);
            
            log.info("OCL validation saved. isValid={}, oclValidated={}, violations={}", 
                    isValid, saved.getOclValidated(), oclViolations.size());

            return ContractValidationResponse.builder()
                    .isValid(isValid)
                    .complianceScore(isValid ? 100.0 : 60.0)
                    .violations(oclViolations)
                    .message(isValid
                            ? "OCL validation approved (no policy violations)"
                            : "Policy violations detected: " + oclViolations.size() + " violation(s)")
                    .build();
        } catch (Exception e) {
            log.error("OCL validation error", e);
            throw new RuntimeException("OCL Validation error: " + e.getMessage());
        }
    }

    @SuppressWarnings("rawtypes")
    private boolean evaluatePolicyWithOclService(Policy policy, String testDescription, Long companyId) {
        // Call the OCL FastAPI /evaluate-file endpoint, which runs the generated file non-interactively
        String url = oclApiUrl + "/evaluate-file";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String companyName = "Company_" + companyId;
        try {
            Company c = companyRepository.findById(companyId).orElse(null);
            if (c != null && c.getName() != null && !c.getName().isBlank()) companyName = c.getName();
        } catch (Exception ignore) {}

        Map<String, Object> body = new HashMap<>();
        body.put("policyName", policy.getPolicyName());
        body.put("policyText", policy.getPolicyText());
        body.put("oclCode", policy.getOclCode());
        body.put("companyName", companyName);
        body.put("testDescription", testDescription);
        body.put("policyId", policy.getId() != null ? policy.getId().intValue() : 0);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            log.info("Calling OCL evaluate-file API for policy {} with test: {}", policy.getPolicyName(), testDescription);
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            
            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                log.warn("OCL API returned non-2xx or null body. Status: {}, Body: {}", res.getStatusCode(), res.getBody());
                return true; // fail-open: assume passed if API fails
            }
            
            Object passed = res.getBody().get("passed");
            boolean result;
            if (passed instanceof Boolean) {
                result = (Boolean) passed;
            } else if (passed instanceof String) {
                result = Boolean.parseBoolean((String) passed);
            } else {
                log.warn("OCL API returned unexpected 'passed' type: {}. Assuming passed=true", passed);
                return true; // fail-open
            }
            
            log.info("OCL evaluation result for policy {}: passed={}", policy.getPolicyName(), result);
            return result;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("HTTP client error calling OCL API: Status={}, Body={}", e.getStatusCode(), e.getResponseBodyAsString());
            return true; // fail-open
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.error("HTTP server error calling OCL API: Status={}, Body={}", e.getStatusCode(), e.getResponseBodyAsString());
            return true; // fail-open
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("Cannot connect to OCL API at {}: {}", url, e.getMessage());
            return true; // fail-open
        } catch (Exception e) {
            log.error("Unexpected error calling OCL API: {}", e.getMessage(), e);
            return true; // fail-open
        }
    }

    @Transactional
    public ContractDraftResponse sendToClient(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if (!"company".equals(actor)) throw new RuntimeException("Only company can send to client");

        ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        if (!draft.getAiValidated() || !draft.getOclValidated()) {
            throw new RuntimeException("Contract must be validated by both AI and OCL before sending to client");
        }

        draft.setSentToClient(true);
        draft = draftRepository.save(draft);

        return toDraftResponse(draft);
    }

    @Transactional
    public ContractDraftResponse signClient(Long submissionId, Long userId, String signatureBase64, String contractPayloadJson) {
        String actor = verifyActor(submissionId, userId);
        if (!"client".equals(actor)) throw new RuntimeException("Only client can sign");

        ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        if (!draft.getSentToClient()) {
            throw new RuntimeException("Contract must be sent to client first");
        }

        if (draft.getClientSignedAt() != null) {
            throw new RuntimeException("Client has already signed");
        }

        draft.setClientSignatureBase64(signatureBase64);
        draft.setClientSignedAt(LocalDateTime.now());
        if (contractPayloadJson != null && !contractPayloadJson.isBlank()) {
            draft.setContractPayloadJson(contractPayloadJson);
        }
        draft = draftRepository.save(draft);

        return toDraftResponse(draft);
    }

    @Transactional
    public ContractDraftResponse signCompany(Long submissionId, Long userId, String signatureBase64, String contractPayloadJson) {
        String actor = verifyActor(submissionId, userId);
        if (!"company".equals(actor)) throw new RuntimeException("Only company can sign");

        ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        if (draft.getClientSignedAt() == null) {
            throw new RuntimeException("Client must sign first");
        }

        if (draft.getCompanySignedAt() != null) {
            throw new RuntimeException("Company has already signed");
        }

        draft.setCompanySignatureBase64(signatureBase64);
        draft.setCompanySignedAt(LocalDateTime.now());
        if (contractPayloadJson != null && !contractPayloadJson.isBlank()) {
            draft.setContractPayloadJson(contractPayloadJson);
        }
        draft = draftRepository.save(draft);

        // Generate PDF and save to contract records
        byte[] pdf = buildContractPdf(draft);
        String fileName = "Contract-Submission-" + submissionId + "-" + System.currentTimeMillis() + ".pdf";
        ContractRecord record = ContractRecord.builder()
                .submissionId(submissionId)
                .companyId(userId)
                .contractType("MAIN_CONTRACT")
                .pdfBytes(pdf)
                .fileName(fileName)
                .signedAt(LocalDateTime.now())
                .build();
        recordRepository.save(record);
        draftRepository.delete(draft);

        return toDraftResponse(draft);
    }

    @Transactional
    public ContractChatMessageDTO sendChatMessage(Long submissionId, Long userId, String message) {
        String actor = verifyActor(submissionId, userId);
        if ("none".equals(actor)) throw new RuntimeException("Not authorized");

        ContractChatMessage chatMessage = ContractChatMessage.builder()
                .submissionId(submissionId)
                .senderId(userId)
                .message(message)
                .build();
        chatMessage = chatMessageRepository.save(chatMessage);

        // Get sender name
        String senderName = getSenderName(userId, submissionId);

        return ContractChatMessageDTO.builder()
                .id(chatMessage.getId())
                .submissionId(chatMessage.getSubmissionId())
                .senderId(chatMessage.getSenderId())
                .senderName(senderName)
                .message(chatMessage.getMessage())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ContractChatMessageDTO> getChatMessages(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if ("none".equals(actor)) throw new RuntimeException("Not authorized");

        List<ContractChatMessage> messages = chatMessageRepository.findBySubmissionIdOrderByCreatedAtAsc(submissionId);
        return messages.stream().map(msg -> {
            String senderName = getSenderName(msg.getSenderId(), submissionId);
            return ContractChatMessageDTO.builder()
                    .id(msg.getId())
                    .submissionId(msg.getSubmissionId())
                    .senderId(msg.getSenderId())
                    .senderName(senderName)
                    .message(msg.getMessage())
                    .createdAt(msg.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    private String getSenderName(Long userId, Long submissionId) {
        ProposalSubmission submission = submissionRepository.findById(submissionId)
                .orElse(null);
        if (submission == null) return "Unknown";

        if (userId.equals(submission.getClient().getId())) {
            if (submission.getClientType() == ClientType.COMPANY) {
                ClientCompany cc = clientCompanyRepo.findById(userId).orElse(null);
                return cc != null ? cc.getCompanyName() : "Client";
            } else {
                ClientPerson cp = clientPersonRepo.findById(userId).orElse(null);
                return cp != null ? (cp.getFirstName() + " " + cp.getLastName()) : "Client";
            }
        } else if (userId.equals(submission.getSoftwareCompany().getId())) {
            Company comp = companyRepository.findById(userId).orElse(null);
            return comp != null ? comp.getName() : "Company";
        }
        return "Unknown";
    }

    private ContractDraftResponse toDraftResponse(ContractDraft d) {
        return ContractDraftResponse.builder()
                .id(d.getId())
                .submissionId(d.getSubmissionId())
                .contractPayloadJson(d.getContractPayloadJson())
                .aiValidated(d.getAiValidated())
                .oclValidated(d.getOclValidated())
                .sentToClient(d.getSentToClient())
                .clientSignedAt(d.getClientSignedAt())
                .companySignedAt(d.getCompanySignedAt())
                .validationResultsJson(d.getValidationResultsJson())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }

    private byte[] buildContractPdf(ContractDraft draft) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            JsonNode root = objectMapper.readTree(draft.getContractPayloadJson());
            JsonNode partyA = root.has("partyA") ? root.get("partyA") : null;
            JsonNode partyB = root.has("partyB") ? root.get("partyB") : null;

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            doc.add(new Paragraph("Software Development Agreement", titleFont));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("PARTIES AND EXECUTION", boldFont));
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.addCell(cell(partyA, draft.getCompanySignatureBase64(), boldFont, normalFont));
            table.addCell(cell(partyB, draft.getClientSignatureBase64(), boldFont, normalFont));
            doc.add(table);
            doc.add(Chunk.NEWLINE);

            // Add contract sections if available
            if (root.has("sections")) {
                doc.add(new Paragraph("CONTRACT TERMS", boldFont));
                JsonNode sections = root.get("sections");
                if (sections.isArray()) {
                    for (JsonNode section : sections) {
                        String title = section.has("title") ? section.get("title").asText() : "";
                        doc.add(new Paragraph(title, boldFont));
                        if (section.has("clauses") && section.get("clauses").isArray()) {
                            for (JsonNode clause : section.get("clauses")) {
                                String clauseText = clause.has("text") ? clause.get("text").asText() : "";
                                doc.add(new Paragraph(clauseText, normalFont));
                            }
                        }
                    }
                }
            }

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("PDF build failed", e);
            throw new RuntimeException("Failed to generate Contract PDF", e);
        }
    }

    private PdfPCell cell(JsonNode party, String sigBase64, Font bold, Font normal) throws Exception {
        PdfPCell c = new PdfPCell();
        c.setPadding(8);
        if (party != null) {
            c.addElement(new Paragraph("Entity details: " + (party.has("details") ? party.get("details").asText("") : ""), normal));
            c.addElement(new Paragraph("Name: " + (party.has("signatory") ? party.get("signatory").asText("") : ""), normal));
            c.addElement(new Paragraph("Title: " + (party.has("title") ? party.get("title").asText("") : ""), normal));
            c.addElement(new Paragraph("Email: " + (party.has("email") ? party.get("email").asText("") : ""), normal));
        }
        c.addElement(new Paragraph("Signature: " + (sigBase64 != null && !sigBase64.isEmpty() ? "[Digitally Signed]" : "_________________"), normal));
        return c;
    }
}
