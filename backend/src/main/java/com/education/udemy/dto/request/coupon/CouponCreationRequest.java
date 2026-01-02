package com.education.udemy.dto.request.coupon;

import com.education.udemy.enums.CouponStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CouponCreationRequest {
    @NotBlank(message = "Mã giảm giá không được để trống")
    @Size(max = 50, message = "Mã không được quá 50 ký tự")
    String code;

    @NotBlank(message = "Loại giảm giá không được để trống")
    String discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal discountValue;

    @Min(value = 1, message = "Số lượng sử dụng tối đa phải từ 1")
    Integer maxUsage;

    @NotNull(message = "Đơn hàng tối thiểu không được để trống")
    BigDecimal minOrderAmount;

    @NotNull(message = "Trạng thái không được để trống")
    CouponStatus couponStatus;

    Instant expiresAt;
}