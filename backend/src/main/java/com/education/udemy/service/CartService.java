package com.education.udemy.service;

import com.education.udemy.dto.response.cart.CartResponse;
import com.education.udemy.entity.Cart;
import com.education.udemy.entity.CartItem;
import com.education.udemy.entity.Course;
import com.education.udemy.entity.User;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.CartMapper;
import com.education.udemy.repository.CartItemRepository;
import com.education.udemy.repository.CartRepository;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CartService {

    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    CourseRepository courseRepository;
    UserRepository userRepository;
    CartMapper cartMapper;

    private User getCurrentUser() {
        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .cartItems(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(String courseId) {
        User user = getCurrentUser();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Cart cart = getOrCreateCart(user);

        if (cart.getCartItems() != null && cart.getCartItems().stream()
                .anyMatch(item -> item.getCourse().getId().equals(courseId))) {
            throw new AppException(ErrorCode.COURSE_ALREADY_IN_CART);
        }

        CartItem item = CartItem.builder()
                .cart(cart)
                .course(course)
                .build();

        cartItemRepository.save(item);

        if (cart.getCartItems() == null) {
            cart.setCartItems(new ArrayList<>());
        }
        cart.getCartItems().add(item);

        log.info("Added course {} to cart {} for user {}", courseId, cart.getId(), user.getUsername());

        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse removeFromCart(String courseId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        if (cart.getCartItems() != null) {
            CartItem itemToRemove = cart.getCartItems().stream()
                    .filter(item -> item.getCourse().getId().equals(courseId))
                    .findFirst()
                    .orElse(null);

            if (itemToRemove != null) {
                cart.getCartItems().remove(itemToRemove);
                cartItemRepository.delete(itemToRemove);
                log.info("Removed course {} from cart {} for user {}", courseId, cart.getId(), user.getUsername());
            } else {
                log.warn("Attempt to remove non-existent course {} from cart {}", courseId, cart.getId());
            }
        }

        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        if (cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
            cartItemRepository.deleteAll(cart.getCartItems());
            cart.getCartItems().clear();
            log.info("Cleared cart {} for user {}", cart.getId(), user.getUsername());
        }
    }

    @Transactional(readOnly = true)
    public int getCartItemCount() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user).orElse(null);

        if (cart == null || cart.getCartItems() == null) {
            return 0;
        }

        return cart.getCartItems().size();
    }
}