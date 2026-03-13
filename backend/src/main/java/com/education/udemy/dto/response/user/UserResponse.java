package com.education.udemy.dto.response.user;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class UserResponse {
    @JsonProperty("_id")
    String id;
    String username;
    String name;
    String phone;
    LocalDate dateOfBirth;
    String avatar;
    String bio;
    String role;
    Boolean active;
    BigDecimal totalSpent;
    Integer enrollmentCount;
    Integer completedCount;
    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}


