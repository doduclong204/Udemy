package com.education.udemy.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.education.udemy.enums.EnrollmentStatus;
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
@Entity(name = "enrollments")
@JsonPropertyOrder(alphabetic = true)
public class Enrollment extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(nullable = false, precision = 5, scale = 2)
    BigDecimal progress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    EnrollmentStatus status;

    Instant enrolledAt;
    Instant completedAt;
    Instant expiresAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    Course course;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL)
    List<LectureProgress> lectureProgresses;
}
