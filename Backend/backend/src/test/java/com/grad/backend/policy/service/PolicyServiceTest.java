package com.grad.backend.policy.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.grad.backend.policy.dto.PolicyConvertRequest;
import com.grad.backend.policy.dto.PolicyConvertResponse;
import com.grad.backend.policy.dto.PolicyResponse;
import com.grad.backend.policy.dto.PolicySaveRequest;
import com.grad.backend.policy.entity.Policy;
import com.grad.backend.policy.repository.PolicyRepository;

class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private PolicyService policyService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(policyService, "oclApiUrl", "http://localhost:5001");
        ReflectionTestUtils.setField(policyService, "uploadDir", System.getProperty("java.io.tmpdir"));
    }

    @Test
    void testConvertPolicy_Success() {
        PolicyConvertRequest request = new PolicyConvertRequest();
        request.setPolicyName("Test Policy");
        request.setPolicyText("Sample Text");

        PolicyConvertResponse responseDto = new PolicyConvertResponse();
        responseDto.setOclCode("context Test inv: true");

        ResponseEntity<PolicyConvertResponse> responseEntity = new ResponseEntity<>(responseDto, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("http://localhost:5001/convert"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(PolicyConvertResponse.class)
        )).thenReturn(responseEntity);

        PolicyConvertResponse result = policyService.convertPolicy(request);

        assertNotNull(result);
        assertEquals("context Test inv: true", result.getOclCode());
    }

    @Test
    void testConvertPolicy_HttpClientErrorException() {
        PolicyConvertRequest request = new PolicyConvertRequest();

        when(restTemplate.exchange(
                anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(PolicyConvertResponse.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Bad Request"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            policyService.convertPolicy(request);
        });

        assertTrue(exception.getMessage().contains("OCL API returned error: 400"));
    }

    @Test
    void testSavePolicy_SuccessWithOclApi() {
        PolicySaveRequest request = new PolicySaveRequest();
        request.setPolicyName("Save Policy");
        request.setOclCode("context user inv:");
        
        Policy savedPolicy = new Policy();
        savedPolicy.setId(10L);
        savedPolicy.setCompanyId(5L);
        savedPolicy.setPolicyName("Save Policy");

        when(policyRepository.save(any(Policy.class))).thenReturn(savedPolicy);

        // Mock OCL API file generation
        ResponseEntity<Map> mapResponseEntity = new ResponseEntity<>(Map.of("filePath", "policies/Company/file.ocl"), HttpStatus.OK);
        when(restTemplate.exchange(
                contains("/generate-file"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(mapResponseEntity);

        PolicyResponse result = policyService.savePolicy(request, 5L, "Company_5");

        assertNotNull(result);
        assertEquals(10L, result.getId());
        // filePath is set from API response - just verify save was called twice (initial + update)
        verify(policyRepository, times(2)).save(any(Policy.class));
    }

    @Test
    void testGetPoliciesByCompany() {
        Policy p1 = new Policy(); p1.setId(1L);
        Policy p2 = new Policy(); p2.setId(2L);

        when(policyRepository.findByCompanyIdOrderByCreatedAtDesc(10L)).thenReturn(Arrays.asList(p1, p2));

        List<PolicyResponse> result = policyService.getPoliciesByCompany(10L);

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void testDeletePolicy_Success() {
        Policy p = new Policy();
        p.setId(1L);
        p.setCompanyId(10L);
        p.setFilePath("some/path.txt");

        when(policyRepository.findById(1L)).thenReturn(Optional.of(p));

        assertDoesNotThrow(() -> policyService.deletePolicy(1L, 10L));
        verify(policyRepository, times(1)).delete(p);
    }

    @Test
    void testDeletePolicy_Unauthorized() {
        Policy p = new Policy();
        p.setId(1L);
        p.setCompanyId(10L);

        when(policyRepository.findById(1L)).thenReturn(Optional.of(p));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            policyService.deletePolicy(1L, 99L);
        });

        assertEquals("You are not authorized to delete this policy", exception.getMessage());
        verify(policyRepository, never()).delete(any());
    }
}
