package com.education.udemy.dto.response.process;

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
public class ProcessResponse {
    @JsonProperty("_id")
    String id;
    String lectureId;
    String enrollmentId;
    Boolean completed;
    Integer watchedDuration;
    Instant lastWatchedAt;
    Instant completedAt;
}
