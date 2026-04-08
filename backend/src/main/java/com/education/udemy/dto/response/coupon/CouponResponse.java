package com.education.udemy.dto.response.coupon;

import com.education.udemy.enums.CouponStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class CouponResponse {
    @JsonProperty("_id")
    String id;
    String code;
    String discountType;
    BigDecimal discountValue;
    Integer maxUsage;
    Integer usedCount;
    BigDecimal minOrderAmount;
    CouponStatus couponStatus;
    Instant expiresAt;
    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}