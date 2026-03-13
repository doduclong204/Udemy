package com.education.udemy.entity;

import java.time.LocalDate;
import java.util.List;

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
public class User extends BaseEntity{
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

    @Builder.Default
    Boolean active = true;

    @OneToMany(mappedBy = "instructor")
    List<Course> courses;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    List<Enrollment> enrollments;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    List<Order> orders;

    @OneToMany(mappedBy = "user")
    List<Review> reviews;

    @OneToMany(mappedBy = "user")
    List<Wishlist> wishlists;

    @OneToOne(mappedBy = "user")
    Cart cart;

    @OneToMany(mappedBy = "user")
    List<UserNotification> userNotifications;
}