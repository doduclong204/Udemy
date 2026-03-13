package com.education.udemy.repository;

import com.education.udemy.entity.Order;
import com.education.udemy.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    @Query("SELECT SUM(o.finalAmount) FROM orders o WHERE o.paymentStatus = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();

    long countByPaymentStatus(OrderStatus status);

    boolean existsByOrderCode(String orderCode);

    @Query("""
        SELECT COUNT(oi) > 0 FROM orders o 
        JOIN o.orderItems oi 
        WHERE o.user.id = :userId 
        AND oi.course.id = :courseId 
        AND o.paymentStatus IN ('PENDING', 'COMPLETED')
        """)
    boolean existsActiveOrderForUserAndCourse(@Param("userId") String userId, @Param("courseId") String courseId);
}