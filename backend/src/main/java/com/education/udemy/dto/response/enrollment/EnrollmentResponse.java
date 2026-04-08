package com.education.udemy.dto.response.enrollment;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class EnrollmentResponse {
    @JsonProperty("_id")
    String id;

    BigDecimal progress;
    String status;
    Instant enrolledAt;

    String courseId;
    String courseTitle;
    String courseThumbnail;

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
}