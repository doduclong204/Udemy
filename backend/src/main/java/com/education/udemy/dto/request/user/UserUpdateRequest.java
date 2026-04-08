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
    String username;

    String password;

    String name;
    String phone;
    LocalDate dateOfBirth;
    String avatar;
    String bio;

    String role;
}
