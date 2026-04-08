package com.education.udemy.dto.response.setting;

import java.time.Instant;

import com.education.udemy.dto.response.lecture.LectureResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SettingResponse {
    @JsonProperty("_id")
    String id;
    String siteName;
    String siteDescription;
    String logo;
    String favicon;
    String primaryColor;
    String contactEmail;
    String contactPhone;
    String contactAddress;
    String facebookLink;
    String youtubeLink;
    String footerText;

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}
