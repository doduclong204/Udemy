package com.education.udemy.dto.response.cart;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    @JsonProperty("_id")
    String id;

    String courseId;
    String courseName;
    String courseImage;
    String author;

    Double rating;
    Integer totalReviews;

    BigDecimal originalPrice;
    BigDecimal salePrice;
}