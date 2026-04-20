package com.education.udemy.dto.response.qa;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QAWebSocketPayload {
    String type;
    String lectureId;
    String courseId;
    QAResponse data;
    String questionId;
}