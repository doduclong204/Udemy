package com.education.udemy.repository;

import com.education.udemy.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, String>, JpaSpecificationExecutor<Coupon> {
    boolean existsByCode(String code);
    Optional<Coupon> findByCode(String code);
}