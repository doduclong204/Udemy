package com.education.udemy.mapper;

import com.education.udemy.dto.request.process.ProcessUpdateRequest;
import com.education.udemy.dto.response.process.ProcessResponse;
import com.education.udemy.entity.LectureProgress;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProcessMapper {

    @Mapping(target = "enrollment", ignore = true)
    @Mapping(target = "lecture", ignore = true)
    @Mapping(target = "id", ignore = true)
    LectureProgress toEntity(ProcessUpdateRequest request);

    @Mapping(target = "lectureId", source = "lecture.id")
    @Mapping(target = "enrollmentId", source = "enrollment.id")
    ProcessResponse toResponse(LectureProgress entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProcess(@MappingTarget LectureProgress entity, ProcessUpdateRequest request);
}