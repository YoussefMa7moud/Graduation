package com.grad.backend.config;

import com.grad.backend.contracts.util.EncryptedStringConverter;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ContractEncryptionConfig {

    @Value("${app.contract.password.key:DefaultContKey16!}")
    private String key;

    @PostConstruct
    public void init() {
        EncryptedStringConverter.setKey(key);
    }
}
