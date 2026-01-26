package com.grad.backend.contracts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.contracts.dto.ContractRecordResponse;
import com.grad.backend.contracts.dto.NdaDraftResponse;
import com.grad.backend.contracts.dto.NdaSignRequest;
import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.entity.NdaSigningDraft;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.contracts.repository.NdaSigningDraftRepository;
import com.grad.backend.events.NdaFullySignedEvent;
import com.grad.backend.config.InternalApiConfig;
import com.grad.backend.project.repository.ProposalSubmissionRepository;
import com.grad.backend.contracts.dto.SignedProjectDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {

    private static final Logger log = LoggerFactory.getLogger(ContractService.class);

    private final NdaSigningDraftRepository draftRepository;
    private final ContractRecordRepository recordRepository;
    private final ProposalSubmissionRepository submissionRepository;
    private final RestTemplate restTemplate;
    private final InternalApiConfig internalApiConfig;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @SuppressWarnings("unchecked")
    private String verifyActor(Long submissionId, Long userId) {
        try {
            String url = internalApiConfig.getBaseUrl() + "/api/internal/submissions/" + submissionId
                    + "/verify-actor?userId=" + userId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Key", internalApiConfig.getInternalKey());
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null && res.getBody().containsKey("actor")) {
                return (String) res.getBody().get("actor");
            }
        } catch (Exception e) {
            log.warn("Verify-actor call failed for submission {} user {}: {}", submissionId, userId, e.getMessage());
        }
        return "none";
    }

    @Transactional(readOnly = true)
    public NdaDraftResponse getDraft(Long submissionId, Long userId) {
        String actor = verifyActor(submissionId, userId);
        if ("none".equals(actor))
            throw new RuntimeException("Not authorized");
        return draftRepository.findBySubmissionId(submissionId)
                .map(this::toDraftResponse)
                .orElse(NdaDraftResponse.builder()
                        .submissionId(submissionId)
                        .clientSigned(false)
                        .companySigned(false)
                        .contractPayloadJson("{}")
                        .build());
    }

    @Transactional
    public NdaDraftResponse signClient(Long submissionId, Long userId, String signatureBase64,
            String contractPayloadJson) {
        String actor = verifyActor(submissionId, userId);
        if (!"client".equals(actor))
            throw new RuntimeException("Only the client may sign as Party B");
        NdaSigningDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseGet(() -> {
                    NdaSigningDraft d = new NdaSigningDraft();
                    d.setSubmissionId(submissionId);
                    d.setContractPayloadJson(contractPayloadJson != null ? contractPayloadJson : "{}");
                    return draftRepository.save(d);
                });
        if (draft.getClientSignedAt() != null)
            throw new RuntimeException("Client has already signed");
        draft.setClientSignatureBase64(signatureBase64);
        draft.setClientSignedAt(LocalDateTime.now());
        if (contractPayloadJson != null && !contractPayloadJson.isBlank())
            draft.setContractPayloadJson(contractPayloadJson);
        draftRepository.save(draft);
        return toDraftResponse(draft);
    }

    @Transactional
    public NdaDraftResponse signCompany(Long submissionId, Long userId, String signatureBase64,
            String contractPayloadJson) {
        // userId = software company id (Company entity shares id with User)
        String actor = verifyActor(submissionId, userId);
        if (!"company".equals(actor))
            throw new RuntimeException("Only the software company may sign as Party A");
        NdaSigningDraft draft = draftRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("No draft found; client must sign first"));
        if (draft.getClientSignedAt() == null)
            throw new RuntimeException("Client must sign first");
        if (draft.getCompanySignedAt() != null)
            throw new RuntimeException("Company has already signed");
        draft.setCompanySignatureBase64(signatureBase64);
        draft.setCompanySignedAt(LocalDateTime.now());
        if (contractPayloadJson != null && !contractPayloadJson.isBlank())
            draft.setContractPayloadJson(contractPayloadJson);
        draftRepository.save(draft);

        byte[] pdf = buildNdaPdf(draft);
        String fileName = "NDA-Submission-" + submissionId + "-" + System.currentTimeMillis() + ".pdf";
        ContractRecord record = ContractRecord.builder()
                .submissionId(submissionId)
                .companyId(userId)
                .contractType("NDA")
                .pdfBytes(pdf)
                .fileName(fileName)
                .signedAt(LocalDateTime.now())
                .build();
        recordRepository.save(record);
        draftRepository.delete(draft);
        eventPublisher.publishEvent(new NdaFullySignedEvent(this, submissionId));
        return NdaDraftResponse.builder()
                .submissionId(submissionId)
                .clientSigned(true)
                .companySigned(true)
                .build();
    }

    private NdaDraftResponse toDraftResponse(NdaSigningDraft d) {
        return NdaDraftResponse.builder()
                .id(d.getId())
                .submissionId(d.getSubmissionId())
                .clientSignedAt(d.getClientSignedAt())
                .companySignedAt(d.getCompanySignedAt())
                .contractPayloadJson(d.getContractPayloadJson())
                .clientSigned(d.getClientSignedAt() != null)
                .companySigned(d.getCompanySignedAt() != null)
                .build();
    }

    private byte[] buildNdaPdf(NdaSigningDraft draft) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4);
            PdfWriter.getInstance(doc, baos);
            doc.open();
            JsonNode root = objectMapper.readTree(draft.getContractPayloadJson());
            JsonNode partyA = root.has("partyA") ? root.get("partyA") : null;
            JsonNode partyB = root.has("partyB") ? root.get("partyB") : null;
            String purpose = root.has("purpose") ? root.get("purpose").asText("") : "";
            String duration = root.has("duration") ? root.get("duration").asText("") : "";
            String dispute = root.has("disputeResolution") ? root.get("disputeResolution").asText("") : "";
            String provisions = root.has("provisions") ? root.get("provisions").asText("") : "";

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            doc.add(new Paragraph("Mutual Non-Disclosure Agreement", titleFont));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("PARTIES AND EXECUTION", boldFont));
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.addCell(cell(partyA, draft.getCompanySignatureBase64(), boldFont, normalFont));
            table.addCell(cell(partyB, draft.getClientSignatureBase64(), boldFont, normalFont));
            doc.add(table);
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("VARIABLES", boldFont));
            doc.add(new Paragraph("Purpose: " + purpose, normalFont));
            doc.add(new Paragraph("Confidentiality period: " + duration, normalFont));
            doc.add(new Paragraph("Dispute Resolution: " + dispute, normalFont));
            doc.add(new Paragraph("Special Provisions: " + provisions, normalFont));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("TERMS", boldFont));
            doc.add(new Paragraph("1. Confidential Information: Information disclosed in connection with the Purpose.",
                    normalFont));
            doc.add(new Paragraph("2. Permitted Receivers: Need-to-know basis only.", normalFont));
            doc.add(new Paragraph("3. Obligations: Use for Purpose only; keep secure; destroy on request.",
                    normalFont));
            doc.add(new Paragraph("4. Governing Law: Arab Republic of Egypt.", normalFont));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("PDF build failed", e);
            throw new RuntimeException("Failed to generate NDA PDF", e);
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

    @Transactional(readOnly = true)
    public List<ContractRecordResponse> listRecordsByCompany(Long companyId) {
        return recordRepository.findByCompanyIdOrderBySignedAtDesc(companyId).stream()
                .map(r -> ContractRecordResponse.builder()
                        .id(r.getId())
                        .submissionId(r.getSubmissionId())
                        .contractType(r.getContractType())
                        .fileName(r.getFileName())
                        .signedAt(r.getSignedAt())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] getPdfByIdAndCompany(Long recordId, Long userId) {
        ContractRecord record = recordRepository.findById(recordId).orElse(null);
        if (record == null)
            return null;

        // Check if user is the Company (Party A)
        if (record.getCompanyId().equals(userId)) {
            return record.getPdfBytes();
        }

        // Check if user is the Client (Party B) via Submission
        return submissionRepository.findById(record.getSubmissionId())
                .filter(sub -> sub.getClient().getId().equals(userId))
                .map(sub -> record.getPdfBytes())
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<com.grad.backend.contracts.dto.SignedProjectDTO> getSignedProjectsForClient(Long clientId) {
        List<com.grad.backend.project.entity.ProposalSubmission> submissions = submissionRepository
                .findByClient_Id(clientId);

        // For each submission, find signed contracts
        return submissions.stream()
                .flatMap(submission -> recordRepository.findBySubmissionId(submission.getId()).stream()
                        .map(record -> com.grad.backend.contracts.dto.SignedProjectDTO.builder()
                                .id(record.getId())
                                .projectName(submission.getProposal().getProjectTitle())
                                .projectType(submission.getProposal().getProjectType())
                                .companyName(submission.getSoftwareCompany().getName()) // Assuming Company has
                                                                                        // getName()
                                .signedAt(record.getSignedAt())
                                .fileName(record.getFileName())
                                .fileSize(record.getPdfBytes() != null ? (long) record.getPdfBytes().length : 0L)
                                .contractType(record.getContractType())
                                .build()))
                .collect(Collectors.toList());
    }
}
