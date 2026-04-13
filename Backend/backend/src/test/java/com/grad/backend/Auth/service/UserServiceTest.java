package com.grad.backend.Auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.grad.backend.Auth.dto.PasswordUpdateRequest;
import com.grad.backend.Auth.dto.ProfileUpdateRequest;
import com.grad.backend.Auth.entity.ClientPerson;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.enums.UserRole;
import com.grad.backend.Auth.repository.ClientPersonRepository;
import com.grad.backend.Auth.repository.UserRepository;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientPersonRepository clientPersonRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword("encodedOldPassword");
        user.setRole(UserRole.SOFTWARE_COMPANY);
    }

    @Test
    void testUpdateProfile_NormalUser_Success() {
        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john@example.com");

        when(userRepository.save(any(User.class))).thenReturn(user);

        User updatedUser = userService.updateProfile(user, request);

        assertEquals("John", updatedUser.getFirstName());
        assertEquals("Doe", updatedUser.getLastName());
        assertEquals("john@example.com", updatedUser.getEmail());

        verify(userRepository, times(1)).save(user);
        verify(clientPersonRepository, never()).findById(anyLong());
    }

    @Test
    void testUpdateProfile_ClientPerson_Success() {
        user.setRole(UserRole.CLIENT_PERSON);

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setEmail("jane@example.com");

        ClientPerson clientPerson = new ClientPerson();
        clientPerson.setId(1L);

        when(userRepository.save(any(User.class))).thenReturn(user);
        when(clientPersonRepository.findById(1L)).thenReturn(Optional.of(clientPerson));

        User updatedUser = userService.updateProfile(user, request);

        assertEquals("Jane", updatedUser.getFirstName());
        
        verify(userRepository, times(1)).save(user);
        verify(clientPersonRepository, times(1)).findById(1L);
        verify(clientPersonRepository, times(1)).save(clientPerson);
        
        assertEquals("Jane", clientPerson.getFirstName());
        assertEquals("Smith", clientPerson.getLastName());
    }

    @Test
    void testUpdatePassword_Success() {
        PasswordUpdateRequest request = new PasswordUpdateRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword");

        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        assertDoesNotThrow(() -> userService.updatePassword(user, request));

        assertEquals("encodedNewPassword", user.getPassword());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testUpdatePassword_WrongOldPassword_ThrowsException() {
        PasswordUpdateRequest request = new PasswordUpdateRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword");

        when(passwordEncoder.matches("wrongPassword", "encodedOldPassword")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.updatePassword(user, request);
        });

        assertEquals("Old password does not match!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
