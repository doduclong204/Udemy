package com.education.udemy.dto.response.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class OrderItemResponse {
    @JsonProperty("_id")
    String id;
    BigDecimal price;
    BigDecimal discountPrice;
    BigDecimal finalPrice;
    String courseId;
    String courseName;
}
