package com.education.udemy.dto.request.section;

import com.education.udemy.dto.request.lecture.LectureUpdateRequest;
import com.education.udemy.enums.Level;
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
public class SectionUpdateRequest {
    String id; // ID của chương hiện tại

    String title;

    List<LectureUpdateRequest> lectures;
}
