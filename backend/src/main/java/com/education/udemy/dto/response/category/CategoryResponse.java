package com.education.udemy.dto.response.category;


import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class CategoryResponse {
    @JsonProperty("_id")
    String id;

    String name;

    String slug;

    String icon;

    String description;

    Integer totalCourses;
    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}
