package com.education.udemy.mapper;

import com.education.udemy.dto.response.lecture.LectureResponse;
import com.education.udemy.entity.Lecture;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LectureMapper {

    // Ánh xạ từ Entity sang Response (Dùng cho API GET)
    @Mapping(target = "id", source = "id") // MapStruct sẽ tự khớp với @JsonProperty("_id")
    LectureResponse toResponse(Lecture lecture);

    // Bạn cũng có thể thêm mapping từ Request sang Entity nếu cần cho API Create/Update
}