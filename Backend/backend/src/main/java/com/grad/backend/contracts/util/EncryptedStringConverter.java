package com.grad.backend.contracts.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static volatile String KEY = "DefaultContKey16!";

    public static void setKey(String key) {
        KEY = key;
    }

    @Override
    public String convertToDatabaseColumn(String plaintext) {
        if (plaintext == null) return null;
        return Contracthashutil.encrypt(plaintext, KEY);
    }

    @Override
    public String convertToEntityAttribute(String ciphertext) {
        if (ciphertext == null) return null;
        return Contracthashutil.decrypt(ciphertext, KEY);
    }
}
