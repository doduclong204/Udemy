package com.education.udemy.entity;

import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "lecture_progress")
@JsonPropertyOrder(alphabetic = true)
public class LectureProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Builder.Default
    Boolean completed = false;

    @Builder.Default
    Integer watchedDuration = 0;

    Instant lastWatchedAt;
    Instant completedAt;

    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    Enrollment enrollment;

    @ManyToOne
    @JoinColumn(name = "lecture_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    Lecture lecture;
}