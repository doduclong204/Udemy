package com.education.udemy.dto.response.review;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class ReviewResponse {
    @JsonProperty("_id")
    String id;
    Integer rating;
    String comment;
    String adminReply;
    boolean reviewStatus;

    UserReviewSummary user;
    CourseReviewSummary course;

    Instant createdAt;
    Instant updatedAt;

    @Data
    @Builder
    public static class UserReviewSummary {
        String id;
        String name;
        String avatar;
    }

    @Data
    @Builder
    public static class CourseReviewSummary {
        String id;
        String title;
    }
}