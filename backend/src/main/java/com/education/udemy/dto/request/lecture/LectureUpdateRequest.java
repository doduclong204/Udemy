package com.education.udemy.dto.request.lecture;

import com.education.udemy.enums.LectureType;
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
public class LectureUpdateRequest {
    String id; // ID của bài học hiện tại

    String title;

    LectureType type;

    String videoUrl;
    String content;
    Integer duration;
    Boolean isFree;
}
