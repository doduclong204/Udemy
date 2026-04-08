package com.education.udemy.mapper;

import com.education.udemy.dto.response.section.SectionResponse;
import com.education.udemy.entity.Section;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {LectureMapper.class})
public interface SectionMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "lectures", source = "lectures") // Tự động dùng LectureMapper để map list
    SectionResponse toResponse(Section section);
}