package com.education.udemy.repository;

import com.education.udemy.entity.Coupon;
import com.education.udemy.enums.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, String>, JpaSpecificationExecutor<Coupon> {

    boolean existsByCode(String code);

    Optional<Coupon> findByCode(String code);

    @Modifying
    @Query("""
        UPDATE coupons c
        SET c.usedCount = c.usedCount + 1
        WHERE c.code = :code
          AND c.couponStatus = 'ACTIVE'
          AND (c.maxUsage IS NULL OR c.usedCount < c.maxUsage)
    """)
    int incrementUsedCount(@Param("code") String code);

    @Modifying
    @Query("""
        UPDATE coupons c
        SET c.couponStatus = 'EXHAUSTED'
        WHERE c.code = :code
          AND c.maxUsage IS NOT NULL
          AND c.usedCount >= c.maxUsage
    """)
    void markExhaustedIfFull(@Param("code") String code);

    @Modifying
    @Query("""
        UPDATE coupons c
        SET c.couponStatus = 'EXPIRED'
        WHERE c.couponStatus = 'ACTIVE'
          AND c.expiresAt IS NOT NULL
          AND c.expiresAt < :now
    """)
    int bulkExpire(@Param("now") Instant now);

    List<Coupon> findByCouponStatus(CouponStatus status);
}