package com.education.udemy.dto.request.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewRequest {
    @Min(1)
    @Max(5)
    Integer rating;

    String comment;

    String courseId;
    String adminReply;
    Boolean reviewStatus;
}