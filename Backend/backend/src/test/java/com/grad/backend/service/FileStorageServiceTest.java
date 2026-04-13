package com.grad.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

class FileStorageServiceTest {

    @InjectMocks
    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        request = new MockHttpServletRequest();
        request.setServerName("localhost");
        request.setServerPort(8080);
        request.setScheme("http");
        
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempDir.toString());
    }

    @Test
    void testStoreFile_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "dummy image content".getBytes()
        );

        String fileUrl = fileStorageService.storeFile(file, "images", request);

        assertNotNull(fileUrl);
        assertTrue(fileUrl.startsWith("http://localhost:8080/uploads/images/"));
        assertTrue(fileUrl.endsWith(".jpg"));
        
        // Count files in subdirectory
        Path subdir = tempDir.resolve("images");
        assertTrue(Files.exists(subdir));
        assertEquals(1, Files.list(subdir).count());
    }

    @Test
    void testStoreFile_EmptyFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[0]
        );

        String result = fileStorageService.storeFile(file, "images", request);
        assertNull(result);
    }

    @Test
    void testStoreFile_NotAnImage() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", "dummy content".getBytes()
        );

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            fileStorageService.storeFile(file, "images", request);
        });

        assertTrue(exception.getMessage().contains("Only image files are allowed"));
    }

    @Test
    void testStoreFile_SizeExceedsLimit() {
        // Mock size by subclassing or we can simply pass a huge byte array (not ideal for memory).
        // Since we check getSize(), MockMultipartFile uses the byte array length.
        // It's safer to not test 11MB byte array. We can use a spy or custom mock.
        org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);
        
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("image/jpeg");
        when(mockFile.getSize()).thenReturn(11L * 1024 * 1024); // 11MB

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            fileStorageService.storeFile(mockFile, "images", request);
        });

        assertTrue(exception.getMessage().contains("exceeds 10MB limit"));
    }

    @Test
    void testDeleteFile_EmptyUrl() {
        assertDoesNotThrow(() -> fileStorageService.deleteFile(null));
        assertDoesNotThrow(() -> fileStorageService.deleteFile(""));
    }

    @Test
    void testDeleteFile_Success() throws IOException {
        // Pre-create file
        Path imageDir = tempDir.resolve("logos");
        Files.createDirectories(imageDir);
        Path dummyFile = imageDir.resolve("logo.png");
        Files.write(dummyFile, "dummy".getBytes());

        assertTrue(Files.exists(dummyFile));

        String url = "http://localhost:8080/uploads/logos/logo.png";
        fileStorageService.deleteFile(url);

        assertFalse(Files.exists(dummyFile));
    }
}
