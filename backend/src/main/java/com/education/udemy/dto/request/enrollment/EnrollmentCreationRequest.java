package com.education.udemy.dto.request.enrollment;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnrollmentCreationRequest {
    @NotBlank(message = "Course ID không được để trống")
    String courseId;
}