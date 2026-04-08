package com.education.udemy.dto.request.order;

import com.education.udemy.enums.PaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderCreationRequest {
    @NotEmpty(message = "Đơn hàng phải có ít nhất một khóa học")
    List<String> courseIds;

    String couponCode;

    @NotNull(message = "Vui lòng chọn phương thức thanh toán")
    PaymentMethod paymentMethod;
}
