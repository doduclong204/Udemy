package com.education.udemy.mapper;

import com.education.udemy.dto.request.lecture_note.LectureNoteCreationRequest;
import com.education.udemy.dto.request.lecture_note.LectureNoteUpdateRequest;
import com.education.udemy.dto.response.lecture_note.LectureNoteResponse;
import com.education.udemy.entity.LectureNote;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface LectureNoteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lecture", ignore = true)
    LectureNote toLectureNote(LectureNoteCreationRequest request);

    @Mapping(target = "lectureId", source = "lecture.id")
    LectureNoteResponse toLectureNoteResponse(LectureNote lectureNote);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lecture", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateLectureNote(@MappingTarget LectureNote lectureNote, LectureNoteUpdateRequest request);
}