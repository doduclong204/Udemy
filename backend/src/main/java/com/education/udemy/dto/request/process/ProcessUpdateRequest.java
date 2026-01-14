package com.education.udemy.dto.request.process;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessUpdateRequest {
    @NotBlank(message = "Lecture ID không được để trống")
    String lectureId;

    Integer watchedDuration;
    Boolean completed;
}
