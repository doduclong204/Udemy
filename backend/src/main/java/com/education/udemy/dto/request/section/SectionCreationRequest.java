package com.education.udemy.dto.request.section;

import com.education.udemy.dto.request.lecture.LectureCreationRequest;
import com.education.udemy.enums.Level;
import jakarta.validation.constraints.NotBlank;
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
public class SectionCreationRequest {
    @NotBlank(message = "Tiêu đề chương không được để trống")
    String title;
    List<LectureCreationRequest> lectures;
}
