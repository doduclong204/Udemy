package com.education.udemy.dto.request.lecture;

import com.education.udemy.enums.LectureType;
import com.education.udemy.enums.Level;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LectureCreationRequest {
    @NotBlank(message = "Tiêu đề bài học không được để trống")
    String title;

    @NotNull(message = "Loại bài học là bắt buộc")
    LectureType type;

    String videoUrl;
    String content;
    Integer duration;

    @Builder.Default
    Boolean isFree = false;
}
