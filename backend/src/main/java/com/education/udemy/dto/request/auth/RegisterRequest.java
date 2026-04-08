package com.education.udemy.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterRequest {

    @NotBlank
    @Email(message = "Invalid email")
    String email;

    @NotBlank
    @Size(min = 8, message = "INVALID_PASSWORD")
    String password;

    @NotBlank
    String name;

    String phone;
}