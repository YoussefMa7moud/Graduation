package com.grad.backend.Auth.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.grad.backend.Auth.dto.ProfileUpdateRequest;
import com.grad.backend.Auth.dto.PasswordUpdateRequest;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal User currentUser, 
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(currentUser, request));
    }

    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(
            @AuthenticationPrincipal User currentUser, 
            @RequestBody PasswordUpdateRequest request) {
        userService.updatePassword(currentUser, request);
        return ResponseEntity.ok("Password updated successfully");
    }
}