package com.education.udemy.dto.response.course;

import java.math.BigDecimal;
import java.util.List;

import com.education.udemy.dto.response.section.SectionResponse;
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
public class CourseDetailResponse {

    @JsonProperty("_id")
    String id;

    String title;

    String smallDescription;

    String description;

    String thumbnail;

    String banner;

    BigDecimal price;

    BigDecimal discountPrice;

    Level level;

    String learningOutcomes;
    BigDecimal rating;

    Long ratingCount;

    Integer totalStudents;

    Integer totalLectures;

    Integer totalDuration;

    String instructorName;

    String instructorBio;

    @JsonProperty("categoryId")
    String categoryId;
    String categoryName;

    Boolean outstanding;

    Boolean isEnrolled;

    Boolean isInWishlist;

    Boolean isInCart;
    List<SectionResponse> sections;
}