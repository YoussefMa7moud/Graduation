package com.grad.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    private Path getUploadPath() {
        // Convert to absolute path to ensure it works correctly
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeFile(MultipartFile file, String subdirectory, HttpServletRequest request) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Validate file type (only images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed. Received: " + contentType);
        }

        // Validate file size (max 10MB)
        long fileSize = file.getSize();
        if (fileSize > 10 * 1024 * 1024) { // 10MB
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        // Create directory if it doesn't exist
        Path baseUploadPath = getUploadPath();
        Path uploadPath = baseUploadPath.resolve(subdirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return FULL URL path
        String relativePath = "/uploads/" + subdirectory + "/" + filename;
        
        return ServletUriComponentsBuilder.fromRequestUri(request)
            .replacePath(relativePath)
            .toUriString();
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Extract the path from the full URL
            java.net.URI uri = new java.net.URI(fileUrl);
            String path = uri.getPath(); // Should be /uploads/logos/filename.jpg
            
            // Remove /uploads/ prefix to get the relative path for filesystem
            String relativePath = path.replaceFirst("/uploads/", "");
            Path baseUploadPath = getUploadPath();
            Path filePath = baseUploadPath.resolve(relativePath);
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            // Log error but don't throw - file deletion is not critical
            System.err.println("Failed to delete file: " + fileUrl);
            e.printStackTrace();
        }
    }
}
