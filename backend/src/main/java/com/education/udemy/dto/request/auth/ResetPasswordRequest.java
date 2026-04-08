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
public class ResetPasswordRequest {

    @NotBlank
    @Email
    String email;

    @NotBlank
    String otp;

    @NotBlank
    @Size(min = 6, message = "INVALID_PASSWORD")
    String newPassword;
}