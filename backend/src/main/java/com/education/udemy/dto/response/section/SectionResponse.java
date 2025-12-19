package com.education.udemy.dto.response.section;

import com.education.udemy.dto.response.lecture.LectureResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SectionResponse {
    @JsonProperty("_id")
    String id;
    String title;
    List<LectureResponse> lectures;
}