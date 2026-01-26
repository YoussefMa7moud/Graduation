package com.grad.backend.Auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.grad.backend.Auth.entity.User;

import com.grad.backend.Auth.dto.LoginRequest;
import com.grad.backend.Auth.dto.LoginResponse;
import com.grad.backend.Auth.dto.RegisterResponse;
import com.grad.backend.Auth.service.AuthService;
import com.grad.backend.Auth.service.RegistrationService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegistrationService registrationService;
    private final AuthService authService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("role") String role,
            @RequestParam(value = "clientType", required = false) String clientType,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "companyName", required = false) String companyName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "nationalId", required = false) String nationalId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "companyRegNo", required = false) String companyRegNo,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber) {
        try {
            RegisterResponse response = registrationService.register(
                    email, password, role, clientType, firstName, lastName,
                    companyName, description, logo, nationalId, title, companyRegNo, phoneNumber);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/register-pm")
    public ResponseEntity<?> registerProjectManager(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password) {
        try {
            RegisterResponse response = registrationService.registerProjectManager(
                    currentUser.getId(), firstName, lastName, email, password);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
