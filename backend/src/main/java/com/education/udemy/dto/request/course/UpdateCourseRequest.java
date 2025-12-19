package com.education.udemy.dto.request.course;

import com.education.udemy.dto.request.section.SectionCreationRequest;
import com.education.udemy.enums.Level;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class UpdateCourseRequest {
    String title;
    String smallDescription;
    String description;
    String thumbnail;
    String banner;
    BigDecimal price;
    BigDecimal discountPrice;
    Level level;
    String learningOutcomes;
    @JsonProperty("categoryId")
    String categoryId;
    Boolean outstanding;
    List<SectionCreationRequest> sections;

}
