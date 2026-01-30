package com.education.udemy.dto.response.lecture_note;

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
public class LectureNoteResponse {
    @JsonProperty("_id")
    String id;

    String content;
    Integer timeInSeconds;
    String lectureId;

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}