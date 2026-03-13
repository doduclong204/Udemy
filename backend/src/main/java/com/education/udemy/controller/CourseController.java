package com.education.udemy.controller;

import com.education.udemy.dto.request.course.CreateCourseRequest;
import com.education.udemy.dto.request.course.UpdateCourseRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.course.CourseDetailResponse;
import com.education.udemy.dto.response.course.CourseSummaryResponse;
import com.education.udemy.entity.Course;
import com.education.udemy.service.CourseService;
import com.education.udemy.util.annotation.ApiMessage;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CourseController {

    CourseService courseService;

    @PostMapping
    @ApiMessage("Create a course success")
    ResponseEntity<CourseDetailResponse> createCourse(@RequestBody @Valid CreateCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(request));
    }

    @GetMapping
    @ApiMessage("Get all courses success")
    ResponseEntity<ApiPagination<CourseSummaryResponse>> getCourses(
            @Filter Specification<Course> spec,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(courseService.getAllCourses(spec, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail course success")
    ResponseEntity<CourseDetailResponse> getCourse(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getDetailCourse(id));
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a course success")
    ResponseEntity<CourseDetailResponse> updateCourse(
            @PathVariable String id,
            @RequestBody @Valid UpdateCourseRequest request) {
        return ResponseEntity.ok(courseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a course success")
    ResponseEntity<ApiString> deleteCourse(@PathVariable String id) {
        courseService.delete(id);
        return ResponseEntity.ok(ApiString.builder()
                .message("success")
                .build());
    }
}