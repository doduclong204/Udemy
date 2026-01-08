package com.education.udemy.repository;

import com.education.udemy.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    boolean existsByCartIdAndCourseId(String cartId, String courseId);
    void deleteByCartIdAndCourseId(String cartId, String courseId);
}