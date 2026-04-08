package com.education.udemy.mapper;

import com.education.udemy.dto.request.enrollment.EnrollmentCreationRequest;
import com.education.udemy.dto.response.enrollment.EnrollmentResponse;
import com.education.udemy.entity.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    @Mapping(target = "course.id", source = "courseId")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lectureProgresses", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "expiresAt", ignore = true)
    Enrollment toEnrollment(EnrollmentCreationRequest request);

    @Mapping(target = "courseId", source = "course.id")
    @Mapping(target = "courseTitle", source = "course.title")
    @Mapping(target = "courseThumbnail", source = "course.thumbnail")
    EnrollmentResponse toEnrollmentResponse(Enrollment enrollment);
}