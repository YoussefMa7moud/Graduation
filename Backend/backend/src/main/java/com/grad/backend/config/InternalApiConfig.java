package com.grad.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class InternalApiConfig {

    @Value("${app.api.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.internal.key:}")
    private String internalKey;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30_000);  // 30 seconds for Modal cold starts
        factory.setReadTimeout(120_000);    // 120 seconds for AI model inference
        return new RestTemplate(factory);
    }

    public String getBaseUrl() { return baseUrl; }
    public String getInternalKey() { return internalKey; }
}
