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
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import com.grad.backend.contracts.dto.*;
import com.grad.backend.contracts.entity.ContractChatMessage;
import com.grad.backend.contracts.entity.ContractDraft;
import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractChatMessageRepository;
import com.grad.backend.contracts.repository.ContractDraftRepository;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.config.InternalApiConfig;
import com.grad.backend.project.DTO.NdaPartiesDTO;
import com.grad.backend.project.entity.ProposalSubmission;
import com.grad.backend.project.enums.ClientType;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.grad.backend.contracts.util.QrCodeGenerator;
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
import com.grad.backend.policy.entity.Policy;
import com.grad.backend.policy.repository.PolicyRepository;
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
    private final CompanyEmployeeRepository companyEmployeeRepository;
    private final ClientCompanyRepository clientCompanyRepo;
    private final ClientPersonRepository clientPersonRepo;
    private final PolicyRepository policyRepository;
    private final RestTemplate restTemplate;
    private final InternalApiConfig internalApiConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ocl.api.url:http://localhost:5001}")
    private String oclApiUrl;

    @Value("${app.ai-model.url:https://yousmahmoud7--egyptian-legal-model-analyze-clause-api.modal.run}")
    private String aiModelUrl;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
                    Map.class);

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

        /*
         * =========================
         * 🔁 FALLBACK (FIXED)
         * =========================
         */
        try {
            ProposalSubmission submission = submissionRepository.findById(submissionId).orElse(null);
            if (submission == null)
                return "none";

            // CLIENT
            if (submission.getClient() != null
                    && submission.getClient().getId().equals(userId)) {
                return "client";
            }

            // COMPANY (FIX ❗)
            Company company = submission.getSoftwareCompany();
            if (company != null) {
                // Check if user is the company owner
                if (company.getUser() != null && company.getUser().getId().equals(userId)) {
                    return "company";
                }
                // Check if user is an employee of this company
                return companyEmployeeRepository.findByUserId(userId)
                    .filter(emp -> emp.getCompany().getId().equals(company.getId()))
                    .map(emp -> "company")
                    .orElse("none");
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
        if ("none".equals(actor))
            throw new RuntimeException("Not authorized");

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
        if ("none".equals(actor))
            throw new RuntimeException("Not authorized");

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
        if ("none".equals(actor))
            throw new RuntimeException("Not authorized");

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
        if (!"company".equals(actor))
            throw new RuntimeException("Only the assigned company can validate");

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

                            Map<String, String> requestBody = Map.of("clause", formattedText);

                            log.info("Validating Clause ID {}: {}", cId, formattedText);

                            try {
                                HttpHeaders aiHeaders = new HttpHeaders();
                                aiHeaders.setContentType(MediaType.APPLICATION_JSON);
                                HttpEntity<Map<String, String>> aiRequest = new HttpEntity<>(requestBody, aiHeaders);

                                ResponseEntity<Map> response = restTemplate.postForEntity(
                                        aiModelUrl, aiRequest, Map.class);

                                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                                    Map<String, Object> body = response.getBody();

                                    // Modal API returns: {"result": "VERDICT: ...\nVIOLATION TYPE: ...\nLEGAL ANALYSIS: ...\nENHANCEMENT: ..."}
                                    String resultText = (String) body.get("result");
                                    log.info("AI response for clause {}: {}", cId, resultText);

                                    if (resultText != null) {
                                        // Clean up any EOS tokens from the model
                                        resultText = resultText.replace("<|eos_id|>", "").trim();

                                        // Parse the structured text response
                                        String verdict = extractField(resultText, "VERDICT");
                                        String violationType = extractField(resultText, "VIOLATION TYPE");
                                        String legalAnalysis = extractField(resultText, "LEGAL ANALYSIS");
                                        String enhancement = extractField(resultText, "ENHANCEMENT");

                                        // Check if the clause is invalid (violation detected)
                                        boolean isInvalid = verdict != null
                                                && (verdict.toUpperCase().contains("INVALID")
                                                    || !verdict.toUpperCase().trim().equals("VALID"));

                                        if (isInvalid) {
                                            String reason = (legalAnalysis != null && !legalAnalysis.isBlank())
                                                    ? legalAnalysis
                                                    : (violationType != null ? "Violation Type: " + violationType : "Violation detected by AI");
                                            String suggestion = (enhancement != null && !enhancement.isBlank())
                                                    ? enhancement
                                                    : "Review this clause for compliance with Egyptian law";

                                            allViolations.add(ViolationDTO.builder()
                                                    .clauseId(cId)
                                                    .clauseText(rawText)
                                                    .reason(reason)
                                                    .suggestion(suggestion)
                                                    .type("LAW")
                                                    .confidence(1.0)
                                                    .build());
                                            minCompliance = Math.min(minCompliance, 0.0);
                                        }
                                    }
                                }
                            } catch (Exception e) {
                                log.error("AI call failed for clause {}: {}", cId, e.getMessage());
                            }
                            clauseIdx++;
                        }
                    }
                }
            }

            // Merge with existing POLICY violations
            List<ViolationDTO> combinedViolations = new ArrayList<>(allViolations);
            if (draft.getValidationResultsJson() != null && !draft.getValidationResultsJson().isBlank()) {
                try {
                    JsonNode jsonNode = objectMapper.readTree(draft.getValidationResultsJson());
                    if (jsonNode.has("violations") && jsonNode.get("violations").isArray()) {
                        for (JsonNode vNode : jsonNode.get("violations")) {
                            ViolationDTO v = objectMapper.treeToValue(vNode, ViolationDTO.class);
                            if ("POLICY".equals(v.getType())) combinedViolations.add(v);
                        }
                    }
                } catch (Exception ignored) {}
            }

            // Save results to DB
            draft.setAiValidated(allViolations.isEmpty());
            Map<String, Object> results = Map.of("violations", combinedViolations, "complianceScore", minCompliance);
            draft.setValidationResultsJson(objectMapper.writeValueAsString(results));
            draftRepository.save(draft);

            return ContractValidationResponse.builder()
                    .isValid(allViolations.isEmpty())
                    .complianceScore(minCompliance)
                    .violations(combinedViolations)
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
        if (!"company".equals(actor))
            throw new RuntimeException("Only company can validate contract");

        ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        List<Policy> companyPolicies = policyRepository.findByCompanyIdOrderByCreatedAtDesc(userId);

        if (companyPolicies.isEmpty()) {
            draft.setOclValidated(true);
            draftRepository.save(draft);
            return ContractValidationResponse.builder()
                    .isValid(true)
                    .complianceScore(100.0)
                    .violations(new ArrayList<>())
                    .message("No company policies defined. Proceeding with contract natively.")
                    .build();
        }

        List<OclValidationRequest.ClauseData> clauseDataList = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(draft.getContractPayloadJson());
            if (root.has("sections")) {
                for (JsonNode section : root.get("sections")) {
                    String sectionTitle = section.path("title").asText();
                    JsonNode clauses = section.get("clauses");
                    if (clauses != null && clauses.isArray()) {
                        for (JsonNode clause : clauses) {
                            String cId = clause.path("id").asText();
                            String text = clause.path("text").asText().trim();
                            if (text.length() >= 10) {
                                clauseDataList.add(OclValidationRequest.ClauseData.builder()
                                        .id(cId)
                                        .sectionTitle(sectionTitle)
                                        .text(text)
                                        .build());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse draft payload: ", e);
            throw new RuntimeException("Draft payload parsing failed.");
        }

        List<OclValidationRequest.PolicyData> policyDataList = companyPolicies.stream()
                .map(p -> OclValidationRequest.PolicyData.builder()
                        .id(p.getId().toString())
                        .text(p.getPolicyText())
                        .oclCode(p.getOclCode())
                        .keywords(p.getKeywords())
                        .build())
                .collect(Collectors.toList());

        OclValidationRequest request = OclValidationRequest.builder()
                .clauses(clauseDataList)
                .policies(policyDataList)
                .build();

        try {
            ResponseEntity<OclValidationResponse> response = restTemplate.postForEntity(
                    oclApiUrl + "/validate-clauses", request, OclValidationResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                OclValidationResponse oclRes = response.getBody();
                
                boolean isValid = oclRes.isValid();
                draft.setOclValidated(isValid);
                
                List<ViolationDTO> oclViolations = oclRes.getViolations() != null ? oclRes.getViolations() : new ArrayList<>();
                for (ViolationDTO v : oclViolations) { v.setType("POLICY"); }

                // Merge with existing LAW violations
                List<ViolationDTO> combinedViolations = new ArrayList<>(oclViolations);
                if (draft.getValidationResultsJson() != null && !draft.getValidationResultsJson().isBlank()) {
                    try {
                        JsonNode jsonNode = objectMapper.readTree(draft.getValidationResultsJson());
                        if (jsonNode.has("violations") && jsonNode.get("violations").isArray()) {
                            for (JsonNode vNode : jsonNode.get("violations")) {
                                ViolationDTO v = objectMapper.treeToValue(vNode, ViolationDTO.class);
                                if ("LAW".equals(v.getType())) combinedViolations.add(v);
                            }
                        }
                    } catch (Exception ignored) {}
                }
                
                Map<String, Object> results = new HashMap<>();
                results.put("violations", combinedViolations);
                results.put("complianceScore", isValid ? 100.0 : 0.0);
                draft.setValidationResultsJson(objectMapper.writeValueAsString(results));
                
                draftRepository.save(draft);

                return ContractValidationResponse.builder()
                        .isValid(isValid)
                        .complianceScore(isValid ? 100.0 : 0.0)
                        .violations(combinedViolations)
                        .message(isValid ? "OCL validation approved" : "OCL validation found violations")
                        .build();
            } else {
                throw new RuntimeException("Validation failed via Python API");
            }
        } catch (Exception e) {
            log.error("OCL API Call Failed: ", e);
            throw new RuntimeException("OCL Validation error: " + e.getMessage());
        }
    }

    @Transactional
    public ContractDraftResponse sendToClient(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if (!"company".equals(actor))
            throw new RuntimeException("Only company can send to client");

        ContractDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        if (!draft.getAiValidated() || !draft.getOclValidated()) {
            throw new RuntimeException("Contract must be validated by both AI and OCL before sending to client");
        }

        draft.setSentToClient(true);
        draft = draftRepository.save(draft);

        // Update ProposalSubmission status to SIGNING
        ProposalSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setStatus(com.grad.backend.project.enums.SubmissionStatus.SIGNING);
        submissionRepository.save(submission);

        return toDraftResponse(draft);
    }

    @Transactional
    public ContractDraftResponse signClient(Long submissionId, Long userId, String signatureBase64,
            String contractPayloadJson) {
        String actor = verifyActor(submissionId, userId);
        if (!"client".equals(actor))
            throw new RuntimeException("Only client can sign");

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
    public ContractDraftResponse signCompany(Long submissionId, Long userId, String signatureBase64,
            String contractPayloadJson) {
        String actor = verifyActor(submissionId, userId);
        if (!"company".equals(actor))
            throw new RuntimeException("Only company can sign");

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
        ContractPartiesResponse partiesRes = getContractParties(submissionId, userId);
        String companyName = partiesRes.getPartyA() != null ? partiesRes.getPartyA().getSignatory() : "Company";
        String clientName = partiesRes.getPartyB() != null ? partiesRes.getPartyB().getSignatory() : "Client";

        byte[] pdf = buildContractPdf(draft, submissionId);
        String fileName = "Contract-Submission-" + submissionId + "-" + System.currentTimeMillis() + ".pdf";
        ContractRecord record = ContractRecord.builder()
                .submissionId(submissionId)
                .companyId(userId)
                .contractType("MAIN_CONTRACT")
                .pdfBytes(pdf)
                .fileName(fileName)
                .signedAt(LocalDateTime.now())
                .clientSignedAt(draft.getClientSignedAt())
                .clientSignatureBase64(draft.getClientSignatureBase64())
                .companySignatureBase64(signatureBase64)
                .clientSignatoryName(clientName)
                .companySignatoryName(companyName)
                .build();
        recordRepository.save(record);
        draftRepository.delete(draft);

        // Update ProposalSubmission status to COMPLETED
        ProposalSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setStatus(com.grad.backend.project.enums.SubmissionStatus.COMPLETED);
        submissionRepository.save(submission);

        return toDraftResponse(draft);
    }

    @Transactional
    public ContractChatMessageDTO sendChatMessage(Long submissionId, Long userId, String message) {
        String actor = verifyActor(submissionId, userId);
        if ("none".equals(actor))
            throw new RuntimeException("Not authorized");

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
        if ("none".equals(actor))
            throw new RuntimeException("Not authorized");

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
        if (submission == null)
            return "Unknown";

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

    private byte[] buildContractPdf(ContractDraft draft, Long submissionId) {
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

            // Add QR Code for verification
            try {
                String verifyUrl = frontendUrl + "/verify-signature/" + submissionId + "?type=MAIN_CONTRACT";
                byte[] qrBytes = QrCodeGenerator.generateQRCodeImage(verifyUrl, 150, 150);
                Image qrImage = Image.getInstance(qrBytes);
                qrImage.setAlignment(Element.ALIGN_CENTER);

                doc.add(Chunk.NEWLINE);

                Paragraph verifyText = new Paragraph("Scan to Verify Signatures & Authenticity", boldFont);
                verifyText.setAlignment(Element.ALIGN_CENTER);
                doc.add(verifyText);

                doc.add(qrImage);

                Paragraph urlText = new Paragraph(verifyUrl, normalFont);
                urlText.setAlignment(Element.ALIGN_CENTER);
                doc.add(urlText);
            } catch (Exception e) {
                log.warn("Could not generate QR code for PDF", e);
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
            c.addElement(new Paragraph(
                    "Entity details: " + (party.has("details") ? party.get("details").asText("") : ""), normal));
            c.addElement(new Paragraph("Name: " + (party.has("signatory") ? party.get("signatory").asText("") : ""),
                    normal));
            c.addElement(new Paragraph("Title: " + (party.has("title") ? party.get("title").asText("") : ""), normal));
            c.addElement(new Paragraph("Email: " + (party.has("email") ? party.get("email").asText("") : ""), normal));
        }
        c.addElement(new Paragraph(
                "Signature: "
                        + (sigBase64 != null && !sigBase64.isEmpty() ? "[Digitally Signed]" : "_________________"),
                normal));
        return c;
    }

    /**
     * Extracts a field value from the AI model's raw text response.
     * The text format is: "FIELD_NAME: value\n\nNEXT_FIELD: value..."
     */
    private String extractField(String text, String fieldName) {
        if (text == null || fieldName == null) return null;

        String[] knownFields = {"VERDICT", "VIOLATION TYPE", "LEGAL ANALYSIS", "ENHANCEMENT"};
        String marker = fieldName + ":";

        int start = text.toUpperCase().indexOf(marker.toUpperCase());
        if (start < 0) return null;

        int valueStart = start + marker.length();

        // Find the next field marker to determine where this field's value ends
        int end = text.length();
        for (String field : knownFields) {
            if (field.equalsIgnoreCase(fieldName)) continue;
            String nextMarker = field + ":";
            int nextIdx = text.toUpperCase().indexOf(nextMarker.toUpperCase(), valueStart);
            if (nextIdx > 0 && nextIdx < end) {
                end = nextIdx;
            }
        }

        return text.substring(valueStart, end).trim();
    }
}
