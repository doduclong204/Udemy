package com.education.udemy.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.education.udemy.enums.CouponStatus;
import com.education.udemy.enums.Level;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "coupons")
@JsonPropertyOrder(alphabetic = true)
public class Coupon extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(nullable = false, unique = true, length = 50)
    String code;

    @Column(nullable = false, length = 20)
    String discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal discountValue;

    Integer maxUsage;
    Integer usedCount;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal minOrderAmount;

    Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    CouponStatus couponStatus;

    @OneToMany(mappedBy = "coupon")
    List<Order> orders;
}