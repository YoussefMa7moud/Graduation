package com.grad.backend.contracts.util;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class QrCodeGeneratorTest {

    @Test
    void testGenerateQRCodeImage_Success() {
        assertDoesNotThrow(() -> {
            byte[] qrCode = QrCodeGenerator.generateQRCodeImage("Hello World", 200, 200);
            assertNotNull(qrCode);
            assertTrue(qrCode.length > 0);
            
            // Check PNG header
            assertEquals((byte) 0x89, qrCode[0]);
            assertEquals((byte) 0x50, qrCode[1]);
            assertEquals((byte) 0x4E, qrCode[2]);
            assertEquals((byte) 0x47, qrCode[3]);
        });
    }

    @Test
    void testGenerateQRCodeImage_EmptyString() {
        // ZXing might throw Exception on empty string
        assertThrows(IllegalArgumentException.class, () -> {
            QrCodeGenerator.generateQRCodeImage("", 200, 200);
        });
    }

    @Test
    void testGenerateQRCodeImage_InvalidDimensions() {
        assertThrows(IllegalArgumentException.class, () -> {
            QrCodeGenerator.generateQRCodeImage("Valid Text", -10, -10);
        });
    }
}
