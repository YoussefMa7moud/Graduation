package com.grad.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class InternalApiConfig {

    @Value("${app.api.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.internal.key:}")
    private String internalKey;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getBaseUrl() { return baseUrl; }
    public String getInternalKey() { return internalKey; }
}
