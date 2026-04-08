package com.education.udemy.dto.response.notification;

import com.education.udemy.enums.NotificationStatus;
import com.education.udemy.enums.NotificationTarget;
import com.education.udemy.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class NotificationResponse {
    @JsonProperty("_id")
    String id;

    NotificationType type;
    String title;
    String message;
    NotificationTarget targetType;
    NotificationStatus status;
    String relatedId;
    String relatedCourseId;
    String relatedType;

    Long totalSent;
    Long totalRead;

    Instant createdAt;
    String createdBy;
}