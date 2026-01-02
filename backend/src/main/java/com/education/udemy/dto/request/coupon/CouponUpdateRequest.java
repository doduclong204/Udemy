package com.education.udemy.dto.request.coupon;

import com.education.udemy.enums.CouponStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CouponUpdateRequest {
    String discountType;
    BigDecimal discountValue;
    Integer maxUsage;
    BigDecimal minOrderAmount;
    CouponStatus couponStatus;
    Instant expiresAt;
}