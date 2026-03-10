package com.education.udemy.dto.response.notification;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserNotificationResponse {
    @JsonProperty("_id")
    String id;

    String title;
    String message;
    String type;
    String relatedId;
    String relatedType;

    @JsonProperty("isRead")
    boolean isRead;
    Instant readAt;
    Instant createdAt;
}