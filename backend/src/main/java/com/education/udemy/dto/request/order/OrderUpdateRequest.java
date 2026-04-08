package com.education.udemy.dto.request.order;

import com.education.udemy.enums.OrderStatus;
import com.education.udemy.enums.PaymentMethod;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderUpdateRequest {
    OrderStatus paymentStatus;
    PaymentMethod paymentMethod;
}