package com.education.udemy.dto.request.course;

import com.education.udemy.dto.request.section.SectionCreationRequest;
import com.education.udemy.enums.Level;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCourseRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    String title;

    @NotBlank(message = "Mô tả ngắn không được để trống")
    String smallDescription;

    @NotBlank(message = "Mô tả chi tiết không được để trống")
    String description;

    @NotBlank(message = "Thumbnail không được để trống")
    String thumbnail;

    @NotBlank(message = "Banner không được để trống")
    String banner;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal price;

    BigDecimal discountPrice;

    @NotNull(message = "Trình độ không được để trống")
    Level level;

    String learningOutcomes;
    @NotNull(message = "Danh mục không được để trống")
    @JsonProperty("categoryId")
    String categoryId;

    List<SectionCreationRequest> sections;
}
