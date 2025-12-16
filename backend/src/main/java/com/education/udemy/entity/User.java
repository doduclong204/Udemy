package com.education.udemy.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.education.udemy.util.SecurityUtil;
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
@Entity(name = "users")
@JsonPropertyOrder(alphabetic = true)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(length = 512)
    String refreshToken;

    @Column(name = "username", unique = true, length = 255, nullable = false)
    String username;
    String password;
    String name;
    @Column(length = 10)
    String phone;
    LocalDate dateOfBirth;
    @Column(length = 500)
    String avatar;
    @Column(columnDefinition = "TEXT")
    String bio;
    String role;

    Boolean isActive;

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;

    @OneToMany(mappedBy = "instructor")
    List<Course> courses;

    @OneToMany(mappedBy = "user")
    List<Enrollment> enrollments;

    @OneToMany(mappedBy = "user")
    List<Order> orders;

    @OneToMany(mappedBy = "user")
    List<Review> reviews;

    @OneToMany(mappedBy = "user")
    List<Wishlist> wishlists;

    @OneToOne(mappedBy = "user")
    Cart cart;

    @OneToMany(mappedBy = "user")
    List<Notification> notifications;
    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.updatedAt = Instant.now();
    }

}