package com.education.udemy.entity;

import java.math.BigDecimal;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "reviews")
@JsonPropertyOrder(alphabetic = true)
public class Review extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    @Column(nullable = false)
    Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    String comment;

    @Column(columnDefinition = "TEXT")
    String adminReply;

    @Builder.Default
    @Column(nullable = false)
    boolean reviewStatus = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    Course course;
}