package com.education.udemy.entity;

import java.math.BigDecimal;
import java.util.List;

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
@Entity(name = "courses")
@JsonPropertyOrder(alphabetic = true)
public class Course extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(nullable = false, length = 255)
    String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    String smallDescription;
    @Column(nullable = false, columnDefinition = "TEXT")
    String description;

    @Column(nullable = false, length = 500)
    String thumbnail;

    @Column(nullable = false, length = 500)
    String banner;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal price;

    @Column(precision = 10, scale = 2)
    BigDecimal discountPrice;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Level level;

    @Builder.Default
    Boolean outstanding = true;

    @Column(columnDefinition = "TEXT")
    private String learningOutcomes;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    BigDecimal rating = BigDecimal.ZERO;
    @Builder.Default
    Long ratingCount = 0L;

    Integer totalStudents;
    Integer totalDuration;
    Integer totalLectures;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    Category category;

    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    User instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Section> sections;

    @OneToMany(mappedBy = "course")
    List<Enrollment> enrollments;

    @OneToMany(mappedBy = "course")
    List<Review> reviews;

    @OneToMany(mappedBy = "course")
    List<OrderItem> orderItems;

    @OneToMany(mappedBy = "course")
    List<CartItem> cartItems;

    @OneToMany(mappedBy = "course")
    List<Wishlist> wishlists;
}