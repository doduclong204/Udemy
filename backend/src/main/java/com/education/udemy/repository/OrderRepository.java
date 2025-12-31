package com.education.udemy.repository;

import com.education.udemy.entity.Order;
import com.education.udemy.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    @Query("SELECT SUM(o.finalAmount) FROM orders o WHERE o.paymentStatus = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();

    long countByPaymentStatus(OrderStatus status);

    boolean existsByOrderCode(String orderCode);
}