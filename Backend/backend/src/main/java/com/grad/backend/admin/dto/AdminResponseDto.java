package com.grad.backend.admin.dto;

import com.grad.backend.Auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponseDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;

    public static AdminResponseDto fromEntity(User user) {
        return new AdminResponseDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );
    }
}
