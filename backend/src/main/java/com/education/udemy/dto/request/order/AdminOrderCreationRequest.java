package com.education.udemy.dto.request.order;

import com.education.udemy.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminOrderCreationRequest {

    @NotBlank(message = "userId is required")
    String userId;

    @NotEmpty(message = "courseIds must not be empty")
    List<String> courseIds;

    String couponCode;

    @NotNull(message = "paymentMethod is required")
    PaymentMethod paymentMethod;
}