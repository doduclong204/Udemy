package com.education.udemy.dto.request.lecture_note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LectureNoteCreationRequest {
    @NotBlank(message = "Nội dung ghi chú không được để trống")
    String content;

    @NotNull(message = "Phải xác định vị trí thời gian của video")
    Integer timeInSeconds;

    @NotBlank(message = "Lecture ID không được để trống")
    String lectureId;
}