package com.grad.backend.admin;

import static org.junit.jupiter.api.Assertions.*;

import com.grad.backend.Auth.entity.User;
import com.grad.backend.admin.dto.AdminResponseDto;
import com.grad.backend.admin.dto.CreateAdminRequest;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

class AdminDtoTest {

    @Test
    void adminResponseDto_fromEntity_Success() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setFirstName("First");
        user.setLastName("Last");

        AdminResponseDto dto = AdminResponseDto.fromEntity(user);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("test@test.com", dto.getEmail());
        assertEquals("First", dto.getFirstName());
        assertEquals("Last", dto.getLastName());
    }

  

    @Test
    void adminResponseDto_fromEntity_NullFields() {
        User user = new User();
        user.setId(1L);

        AdminResponseDto dto = AdminResponseDto.fromEntity(user);

        assertEquals(1L, dto.getId());
        assertNull(dto.getEmail());
        assertNull(dto.getFirstName());
        assertNull(dto.getLastName());
    }

    @Test
    void adminResponseDto_Constructor_AllArgs() {
        AdminResponseDto dto = new AdminResponseDto(1L, "test@test.com", "First", "Last");

        assertEquals(1L, dto.getId());
        assertEquals("test@test.com", dto.getEmail());
        assertEquals("First", dto.getFirstName());
        assertEquals("Last", dto.getLastName());
    }

    @Test
    void adminResponseDto_NoArgsConstructor() {
        AdminResponseDto dto = new AdminResponseDto();

        assertNull(dto.getId());
        assertNull(dto.getEmail());
        assertNull(dto.getFirstName());
        assertNull(dto.getLastName());
    }

    @Test
    void adminResponseDto_SettersGetters() {
        AdminResponseDto dto = new AdminResponseDto();
        dto.setId(1L);
        dto.setEmail("test@test.com");
        dto.setFirstName("First");
        dto.setLastName("Last");

        assertEquals(1L, dto.getId());
        assertEquals("test@test.com", dto.getEmail());
        assertEquals("First", dto.getFirstName());
        assertEquals("Last", dto.getLastName());
    }

    @Test
    void createAdminRequest_SettersGetters() {
        CreateAdminRequest request = new CreateAdminRequest();
        request.setEmail("new@test.com");
        request.setPassword("pass123");
        request.setFirstName("New");
        request.setLastName("Admin");

        assertEquals("new@test.com", request.getEmail());
        assertEquals("pass123", request.getPassword());
        assertEquals("New", request.getFirstName());
        assertEquals("Admin", request.getLastName());
    }

    @Test
    void createAdminRequest_NoArgsConstructor() {
        CreateAdminRequest request = new CreateAdminRequest();

        assertNull(request.getEmail());
        assertNull(request.getPassword());
        assertNull(request.getFirstName());
        assertNull(request.getLastName());
    }
}
