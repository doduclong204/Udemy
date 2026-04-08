package com.education.udemy.dto.request.setting;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SettingRequest {
    @NotBlank(message = "Tên website không được để trống")
    String siteName;

    String siteDescription;

    @NotBlank(message = "Logo không được để trống")
    String logo;

    String favicon;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Mã màu không hợp lệ")
    String primaryColor;

    String contactEmail;

    String contactPhone;
    String contactAddress;
    String facebookLink;
    String youtubeLink;
    String footerText;
}
