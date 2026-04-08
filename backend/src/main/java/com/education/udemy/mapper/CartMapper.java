package com.education.udemy.mapper;

import com.education.udemy.dto.response.cart.CartItemResponse;
import com.education.udemy.dto.response.cart.CartResponse;
import com.education.udemy.entity.Cart;
import com.education.udemy.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "courseId", source = "course.id")
    @Mapping(target = "courseName", source = "course.title")
    @Mapping(target = "courseImage", source = "course.thumbnail")
    @Mapping(target = "author", source = "course.instructor.name")
    @Mapping(target = "rating", source = "course.rating")
    @Mapping(target = "totalReviews", source = "course.ratingCount")
    @Mapping(target = "originalPrice", source = "course.price")
    @Mapping(target = "salePrice", source = "course.discountPrice")
    CartItemResponse toCartItemResponse(CartItem cartItem);

    default CartResponse toCartResponse(Cart cart) {
        if (cart == null) return null;

        List<CartItemResponse> items = (cart.getCartItems() != null)
                ? cart.getCartItems().stream().map(this::toCartItemResponse).toList()
                : Collections.emptyList();

        BigDecimal totalOriginal = items.stream()
                .map(item -> item.getOriginalPrice() != null ? item.getOriginalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSale = items.stream()
                .map(item -> item.getSalePrice() != null ? item.getSalePrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDiscount = totalOriginal.subtract(totalSale);

        String percentage = "0%";
        if (totalOriginal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal percent = totalDiscount.multiply(new BigDecimal(100))
                    .divide(totalOriginal, 0, RoundingMode.HALF_UP);
            percentage = percent + "%";
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalOriginalPrice(totalOriginal)
                .totalSalePrice(totalSale)
                .totalDiscount(totalDiscount)
                .discountPercentage(percentage)
                .build();
    }
}