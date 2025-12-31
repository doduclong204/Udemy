package com.education.udemy.entity;

import java.math.BigDecimal;
import java.time.Instant;
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
@Entity(name = "order_items")
@JsonPropertyOrder(alphabetic = true)
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal price;

    @Column(precision = 10, scale = 2)
    BigDecimal discountPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal finalPrice;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    Course course;
}