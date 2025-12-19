package com.education.udemy.dto.response.lecture;

import com.education.udemy.enums.LectureType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LectureResponse {
    @JsonProperty("_id")
    String id;
    String title;
    LectureType type;
    String videoUrl;
    String content;
    Integer duration;
    Boolean isFree;
}