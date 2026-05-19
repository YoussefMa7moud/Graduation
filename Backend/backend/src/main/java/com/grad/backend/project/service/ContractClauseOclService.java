package com.grad.backend.project.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.grad.backend.Auth.entity.Company;
import com.grad.backend.Auth.repository.CompanyEmployeeRepository;
import com.grad.backend.Auth.repository.CompanyRepository;
import com.grad.backend.contracts.entity.ContractRecord;
import com.grad.backend.contracts.repository.ContractRecordRepository;
import com.grad.backend.project.DTO.ClauseOclConstraintDTO;
import com.grad.backend.project.DTO.ExtractClauseOclResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractClauseOclService {

    private final ContractRecordRepository contractRecordRepository;
    private final CompanyRepository companyRepository;
    private final CompanyEmployeeRepository companyEmployeeRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ocl.api.url:http://localhost:5001}")
    private String oclApiUrl;

    @Transactional
    public ExtractClauseOclResponse extractFromContractRecord(Long contractRecordId, Long companyUserId) {
        Company company = companyRepository.findByUser_Id(companyUserId)
                .orElseGet(() -> companyEmployeeRepository.findByUserId(companyUserId)
                        .map(emp -> emp.getCompany())
                        .orElseThrow(() -> new RuntimeException("Company not found for user")));

        ContractRecord record = contractRecordRepository.findById(contractRecordId)
                .orElseThrow(() -> new RuntimeException("Contract Record not found"));

        if (!record.getCompanyId().equals(company.getId())) {
            throw new RuntimeException("Unauthorized: Contract does not belong to this company");
        }

        if (!"MAIN_CONTRACT".equals(record.getContractType())) {
            throw new RuntimeException("OCL extraction is only supported for main contracts");
        }

        String payloadJson = record.getContractPayloadJson();
        if (payloadJson == null || payloadJson.isBlank()) {
            throw new RuntimeException("Contract has no payload to extract clauses from");
        }

        List<ClauseOclConstraintDTO> constraints = callOclExtractApi(payloadJson);
        String enrichedPayload = mergeOclIntoPayload(payloadJson, constraints);
        record.setContractPayloadJson(enrichedPayload);
        contractRecordRepository.save(record);

        String oclRulesJson = buildOclRulesBundle(constraints);
        return ExtractClauseOclResponse.builder()
                .constraints(constraints)
                .oclRulesJson(oclRulesJson)
                .build();
    }

    public String buildOclRulesBundle(List<ClauseOclConstraintDTO> constraints) {
        try {
            Map<String, Object> bundle = new HashMap<>();
            bundle.put("version", 1);
            bundle.put("constraints", constraints);
            return objectMapper.writeValueAsString(bundle);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize OCL rules bundle", e);
        }
    }

    private List<ClauseOclConstraintDTO> callOclExtractApi(String payloadJson) {
        try {
            JsonNode payloadNode = objectMapper.readTree(payloadJson);
            Map<String, Object> body = Map.of("contractPayload", objectMapper.convertValue(payloadNode, Map.class));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            String url = oclApiUrl + "/extract-clauses-ocl";
            log.info("Calling OCL clause extraction at: {}", url);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("OCL API returned empty response");
            }

            Object constraintsObj = response.getBody().get("constraints");
            if (constraintsObj == null) {
                return new ArrayList<>();
            }

            return objectMapper.convertValue(
                    constraintsObj,
                    new TypeReference<List<ClauseOclConstraintDTO>>() {});
        } catch (Exception e) {
            log.error("OCL clause extraction failed: {}", e.getMessage(), e);
            throw new RuntimeException(
                    "Failed to extract OCL from contract clauses. Ensure the OCL service is running on " + oclApiUrl,
                    e);
        }
    }

    private String mergeOclIntoPayload(String payloadJson, List<ClauseOclConstraintDTO> constraints) {
        try {
            ObjectNode root = (ObjectNode) objectMapper.readTree(payloadJson);
            if (!root.has("sections") || !root.get("sections").isArray()) {
                return payloadJson;
            }

            Map<String, ClauseOclConstraintDTO> byId = new HashMap<>();
            for (ClauseOclConstraintDTO c : constraints) {
                if (c.getClauseId() != null) {
                    byId.put(c.getClauseId(), c);
                }
            }

            ArrayNode sections = (ArrayNode) root.get("sections");
            for (JsonNode sectionNode : sections) {
                if (!sectionNode.isObject() || !sectionNode.has("clauses")) {
                    continue;
                }
                JsonNode clausesNode = sectionNode.get("clauses");
                if (!clausesNode.isArray()) {
                    continue;
                }
                for (JsonNode clauseNode : clausesNode) {
                    if (!clauseNode.isObject()) {
                        continue;
                    }
                    ObjectNode clauseObj = (ObjectNode) clauseNode;
                    String id = clauseObj.path("id").asText();
                    ClauseOclConstraintDTO match = byId.get(id);
                    if (match != null) {
                        clauseObj.put("oclCode", match.getOclCode());
                        clauseObj.put("oclExplanation", match.getExplanation());
                    }
                }
            }

            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            log.warn("Could not merge OCL into contract payload: {}", e.getMessage());
            return payloadJson;
        }
    }
}
