package com.education.udemy.entity;

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
@Entity(name = "cart_items")
@JsonPropertyOrder(alphabetic = true)
public class CartItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    Cart cart;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    Course course;
}