package com.education.udemy.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.education.udemy.enums.OrderStatus;
import com.education.udemy.enums.PaymentMethod;
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
@Entity(name = "orders")
@JsonPropertyOrder(alphabetic = true)
public class Order extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(nullable = false, unique = true, length = 50)
    String orderCode;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal totalAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal discountAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    OrderStatus paymentStatus;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "coupon_id")
    Coupon coupon;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    List<OrderItem> orderItems;
}
