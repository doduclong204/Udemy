package com.education.udemy.dto.response.course;

import java.math.BigDecimal;

import com.education.udemy.enums.Level;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class CourseSummaryResponse {

    @JsonProperty("_id")
    String id;

    String title;

    String thumbnail;

    BigDecimal price;

    BigDecimal discountPrice;

    Level level;

    Integer totalStudents;


    String categoryName;

    Boolean outstanding;
}