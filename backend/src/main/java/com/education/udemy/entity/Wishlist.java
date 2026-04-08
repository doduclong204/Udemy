package com.education.udemy.entity;

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
@Entity(name = "wishlists")
@Table(name = "wishlists", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "course_id"})
})
@JsonPropertyOrder(alphabetic = true)
public class Wishlist extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    Course course;
}