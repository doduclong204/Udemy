package com.education.udemy.dto.response.wishlist;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class WishlistResponse {
    @JsonProperty("_id")
    String id;
    String courseId;
    String title;
    String thumbnail;
    BigDecimal price;
    BigDecimal oldPrice;
}