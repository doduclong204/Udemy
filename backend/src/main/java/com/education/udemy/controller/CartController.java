package com.education.udemy.controller;

import com.education.udemy.dto.response.cart.CartResponse;
import com.education.udemy.service.CartService;
import com.education.udemy.util.annotation.ApiMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    @GetMapping("/me")
    @ApiMessage("Get current user cart success")
    public ResponseEntity<CartResponse> getMyCart() {
        return ResponseEntity.ok(cartService.getMyCart());
    }

    @PostMapping("/add/{courseId}")
    @ApiMessage("Add course to cart success")
    public ResponseEntity<CartResponse> addToCart(@PathVariable String courseId) {
        return ResponseEntity.ok(cartService.addToCart(courseId));
    }

    @DeleteMapping("/remove/{courseId}")
    @ApiMessage("Remove course from cart success")
    public ResponseEntity<CartResponse> removeFromCart(@PathVariable String courseId) {
        return ResponseEntity.ok(cartService.removeFromCart(courseId));
    }

    @DeleteMapping("/clear")
    @ApiMessage("Clear cart success")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @ApiMessage("Get cart item count success")
    public ResponseEntity<Integer> getCartItemCount() {
        return ResponseEntity.ok(cartService.getCartItemCount());
    }
}