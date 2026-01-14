package com.education.udemy.dto.request.qa;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QARequest {
    @NotBlank(message = "Nội dung không được để trống")
    String content;

    String title;
    String courseId;
    String lectureId;
    String questionId;
}