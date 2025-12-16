package com.education.udemy.dto.response;

import java.time.Instant;
import java.util.List;

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
    String address;
    String role;
    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}


