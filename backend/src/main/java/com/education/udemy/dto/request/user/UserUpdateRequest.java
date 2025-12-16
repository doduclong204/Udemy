package com.education.udemy.dto.request.user;


import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    @Size(min = 4, message = "USERNAME_INVALID")
    String username;

    @Size(min = 6, message = "INVALID_PASSWORD")
    String password;

    @NotBlank
    String name;
    String phone;
    LocalDate dateOfBirth;
    @Column(length = 500)
    String avatar;
    @Column(columnDefinition = "TEXT")
    String bio;

    String role;
}
