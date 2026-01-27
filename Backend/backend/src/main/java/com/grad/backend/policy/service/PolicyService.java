package com.grad.backend.policy.service;

import com.grad.backend.policy.dto.*;
import com.grad.backend.policy.entity.Policy;
import com.grad.backend.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final RestTemplate restTemplate;

    @Value("${app.ocl.api.url:http://localhost:5001}")
    private String oclApiUrl;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public PolicyConvertResponse convertPolicy(PolicyConvertRequest request) {
        try {
            String url = oclApiUrl + "/convert";
            log.info("Calling OCL API at: {}", url);
            log.info("Request payload: policyName={}, legalFramework={}, policyText={}",
                    request.getPolicyName(), request.getLegalFramework(), request.getPolicyText());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            HttpEntity<PolicyConvertRequest> entity = new HttpEntity<>(request, headers);

            try {
                ResponseEntity<PolicyConvertResponse> response = restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        PolicyConvertResponse.class);

                if (response.getBody() == null) {
                    log.error("OCL API returned null response");
                    throw new RuntimeException("OCL API returned null response");
                }

                log.info("OCL API response received successfully");
                return response.getBody();
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                log.error("HTTP error calling OCL API: Status={}, Body={}", e.getStatusCode(),
                        e.getResponseBodyAsString());
                throw new RuntimeException(
                        "OCL API returned error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
            } catch (org.springframework.web.client.HttpServerErrorException e) {
                log.error("Server error from OCL API: Status={}, Body={}", e.getStatusCode(),
                        e.getResponseBodyAsString());
                throw new RuntimeException(
                        "OCL API server error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
            } catch (org.springframework.web.client.ResourceAccessException e) {
                log.error("Cannot connect to OCL API at {}: {}", url, e.getMessage());
                throw new RuntimeException(
                        "Cannot connect to OCL API. Please ensure the OCL service is running on " + oclApiUrl, e);
            }
        } catch (RuntimeException e) {
            // Re-throw RuntimeException as-is
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error calling OCL API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to convert policy to OCL: " + e.getMessage(), e);
        }
    }

    public PolicyResponse savePolicy(PolicySaveRequest request, Long companyId, String companyName) {
        try {
            // First save the policy to get the ID
            Policy policy = Policy.builder()
                    .companyId(companyId)
                    .policyName(request.getPolicyName())
                    .legalFramework(request.getLegalFramework())
                    .policyText(request.getPolicyText())
                    .oclCode(request.getOclCode())
                    .explanation(request.getExplanation())
                    .articleRef(request.getArticleRef())
                    .category(request.getCategory())
                    .keywords(request.getKeywords() != null ? String.join(",", request.getKeywords()) : null)
                    .filePath(null) // Will be set after file generation
                    .build();

            Policy saved = policyRepository.save(policy);

            // Generate comprehensive test file using OCL API
            String filePath = generateTestFileFromOCLAPI(
                    saved.getId(),
                    request.getPolicyName(),
                    request.getPolicyText(),
                    request.getOclCode(),
                    companyName != null ? companyName : "Company_" + companyId);

            // Update policy with file path
            saved.setFilePath(filePath);
            saved = policyRepository.save(saved);

            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("Error saving policy: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save policy: " + e.getMessage(), e);
        }
    }

    private String generateTestFileFromOCLAPI(Long policyId, String policyName, String policyText,
            String oclCode, String companyName) {
        try {
            String url = oclApiUrl + "/generate-file";

            // Build query parameters
            String queryParams = String.format(
                    "?policyName=%s&policyText=%s&oclCode=%s&companyName=%s&policyId=%d",
                    java.net.URLEncoder.encode(policyName, java.nio.charset.StandardCharsets.UTF_8),
                    java.net.URLEncoder.encode(policyText, java.nio.charset.StandardCharsets.UTF_8),
                    java.net.URLEncoder.encode(oclCode, java.nio.charset.StandardCharsets.UTF_8),
                    java.net.URLEncoder.encode(companyName, java.nio.charset.StandardCharsets.UTF_8),
                    policyId);

            url += queryParams;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    java.util.Map.class);

            if (response.getBody() != null && response.getBody().containsKey("filePath")) {
                String filePath = (String) response.getBody().get("filePath");
                log.info("Generated test file: {}", filePath);
                return filePath;
            } else {
                log.warn("OCL API did not return filePath, generating simple OCL file instead");
                return generateSimpleOclFile(policyName, oclCode, companyName);
            }
        } catch (Exception e) {
            log.error("Error calling OCL API for file generation: {}", e.getMessage(), e);
            log.warn("Falling back to simple OCL file generation");
            return generateSimpleOclFile(policyName, oclCode, companyName);
        }
    }

    private String generateSimpleOclFile(String policyName, String oclCode, String companyName) {
        try {
            // Create uploads directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "policies", companyName.replaceAll("[^a-zA-Z0-9]", "_"));
            Files.createDirectories(uploadPath);

            // Generate filename
            String sanitizedName = policyName.replaceAll("[^a-zA-Z0-9]", "_");
            String fileName = sanitizedName + "_" + System.currentTimeMillis() + ".ocl";
            Path filePath = uploadPath.resolve(fileName);

            // Write OCL code to file
            try (FileWriter writer = new FileWriter(filePath.toFile())) {
                writer.write("-- Policy: " + policyName + "\n");
                writer.write("-- Generated: " + LocalDateTime.now() + "\n\n");
                writer.write("context Policy inv:\n");
                writer.write("    " + oclCode + "\n");
            }

            // Return relative path
            return "policies/" + companyName.replaceAll("[^a-zA-Z0-9]", "_") + "/" + fileName;
        } catch (IOException e) {
            log.error("Error generating simple OCL file: {}", e.getMessage(), e);
            return null;
        }
    }

    public List<PolicyResponse> getPoliciesByCompany(Long companyId) {
        return policyRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PolicyResponse mapToResponse(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .legalFramework(policy.getLegalFramework())
                .policyText(policy.getPolicyText())
                .oclCode(policy.getOclCode())
                .explanation(policy.getExplanation())
                .articleRef(policy.getArticleRef())
                .category(policy.getCategory())
                .keywords(policy.getKeywords())
                .filePath(policy.getFilePath())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    public void deletePolicy(Long policyId, Long companyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getCompanyId().equals(companyId)) {
            throw new RuntimeException("You are not authorized to delete this policy");
        }

        // Optional: Delete the file associated with the policy if it exists
        if (policy.getFilePath() != null) {
            try {
                Path filePath = Paths.get(uploadDir, policy.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.warn("Failed to delete policy file: {}", e.getMessage());
            }
        }

        policyRepository.delete(policy);
    }
}
