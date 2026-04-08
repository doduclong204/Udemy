package com.education.udemy.dto.response.order;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class OrderResponse {
    @JsonProperty("_id")
    String id;
    String orderCode;
    BigDecimal totalAmount;
    BigDecimal discountAmount;
    BigDecimal finalAmount;
    String paymentMethod;
    String paymentStatus;
    List<OrderItemResponse> orderItems;
    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}
