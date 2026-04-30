package com.education.udemy.repository;

import com.education.udemy.entity.Order;
import com.education.udemy.enums.OrderStatus;
import com.education.udemy.enums.PaymentMethod;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    @Query("SELECT SUM(o.finalAmount) FROM orders o WHERE o.paymentStatus = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();

    long countByPaymentStatus(OrderStatus status);

    boolean existsByOrderCode(String orderCode);

    Optional<Order> findByOrderCode(String orderCode);

    @Query("""
    SELECT o FROM orders o
    WHERE o.paymentMethod = :method
    AND o.paymentStatus = :status
    AND o.createdAt < :cutoff
    """)
    List<Order> findExpiredVnpayOrders(
            @Param("method") PaymentMethod method,
            @Param("status") OrderStatus status,
            @Param("cutoff") Instant cutoff
    );

    @Query("""
        SELECT COUNT(oi) > 0 FROM orders o 
        JOIN o.orderItems oi 
        WHERE o.user.id = :userId 
        AND oi.course.id = :courseId 
        AND o.paymentStatus IN ('PENDING', 'COMPLETED')
        """)
    boolean existsActiveOrderForUserAndCourse(@Param("userId") String userId, @Param("courseId") String courseId);


    @Query("""
        SELECT COALESCE(SUM(o.finalAmount), 0)
        FROM orders o
        WHERE o.paymentStatus = 'COMPLETED'
        AND o.createdAt >= :from AND o.createdAt <= :to
        """)
    BigDecimal sumRevenueByRange(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COUNT(o) FROM orders o WHERE o.createdAt >= :from AND o.createdAt <= :to")
    long countOrdersByRange(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
        SELECT COUNT(o) FROM orders o
        WHERE o.paymentStatus = 'COMPLETED'
        AND o.createdAt >= :from AND o.createdAt <= :to
        """)
    long countCompletedByRange(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
        SELECT COUNT(o) FROM orders o
        WHERE o.paymentStatus = 'PENDING'
        AND o.createdAt >= :from AND o.createdAt <= :to
        """)
    long countPendingByRange(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT HOUR(created_at) AS bucket,
               COALESCE(SUM(CASE WHEN payment_status='COMPLETED' THEN final_amount ELSE 0 END), 0) AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE created_at >= :from AND created_at <= :to
        GROUP BY HOUR(created_at)
        ORDER BY bucket
        """, nativeQuery = true)
    List<Object[]> chartByHour(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT DATE(created_at) AS bucket,
               COALESCE(SUM(CASE WHEN payment_status='COMPLETED' THEN final_amount ELSE 0 END), 0) AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE created_at >= :from AND created_at <= :to
        GROUP BY DATE(created_at)
        ORDER BY bucket
        """, nativeQuery = true)
    List<Object[]> chartByDay(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS bucket,
               COALESCE(SUM(CASE WHEN payment_status='COMPLETED' THEN final_amount ELSE 0 END), 0) AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE created_at >= :from AND created_at <= :to
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY bucket
        """, nativeQuery = true)
    List<Object[]> chartByMonth(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT oi.course_id                     AS courseId,
               c.title                          AS title,
               c.thumbnail                      AS thumbnail,
               COUNT(oi.id)                     AS students,
               COALESCE(SUM(oi.final_price), 0) AS revenue
        FROM order_items oi
        JOIN orders o  ON oi.order_id  = o.id
        JOIN courses c ON oi.course_id = c.id
        WHERE o.payment_status = 'COMPLETED'
          AND o.created_at >= :from AND o.created_at <= :to
        GROUP BY oi.course_id, c.title, c.thumbnail
        ORDER BY revenue DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> topCoursesByRevenue(
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("limit") int limit);

    @Query("""
        SELECT o FROM orders o
        WHERE o.createdAt >= :from AND o.createdAt <= :to
        ORDER BY o.createdAt DESC
        """)
    List<Order> findRecentOrders(
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable);

    @Modifying
    @Transactional
    void deleteByUserId(String userId);
}