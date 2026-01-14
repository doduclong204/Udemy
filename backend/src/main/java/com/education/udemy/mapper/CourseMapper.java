package com.education.udemy.mapper;

import com.education.udemy.dto.request.course.CreateCourseRequest;
import com.education.udemy.dto.request.course.UpdateCourseRequest;
import com.education.udemy.dto.response.course.CourseDetailResponse;
import com.education.udemy.dto.response.course.CourseSummaryResponse;
import com.education.udemy.entity.Course;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {SectionMapper.class})
public interface CourseMapper {


    @Mapping(target = "category", ignore = true)
    Course toCourse(CreateCourseRequest request);

    @Mapping(target = "categoryName", source = "category.name")
    CourseSummaryResponse toSummaryResponse(Course course);

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "instructorName", source = "instructor.name")
    @Mapping(target = "instructorBio", source = "instructor.bio")
    CourseDetailResponse toDetailResponse(Course course);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category", ignore = true) // Xử lý set Category riêng trong Service
    void updateCourse(@MappingTarget Course course, UpdateCourseRequest request);
}