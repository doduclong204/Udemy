package com.education.udemy.dto.response.qa;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class QAResponse {
    @JsonProperty("_id")
    String id;
    String title;
    String content;
    boolean answered;
    boolean instructorAnswer;

    UserQASummary user;
    Instant createdAt;
    Instant updatedAt;

    @Data
    @Builder
    public static class UserQASummary {
        String id;
        String name;
        String avatar;
    }
}