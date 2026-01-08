package com.education.udemy.dto.response.cart;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class CartResponse {
    @JsonProperty("_id")
    String id;

    List<CartItemResponse> items;

    BigDecimal totalOriginalPrice;
    BigDecimal totalSalePrice;
    BigDecimal totalDiscount;
    String discountPercentage;
}