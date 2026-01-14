package com.education.udemy.controller;

import com.education.udemy.dto.request.enrollment.EnrollmentCreationRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.enrollment.EnrollmentResponse;
import com.education.udemy.entity.Enrollment;
import com.education.udemy.service.EnrollmentService;
import com.education.udemy.util.annotation.ApiMessage;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentController {

    EnrollmentService enrollmentService;

    @PostMapping
    @ApiMessage("Ghi danh khóa học thành công")
    ResponseEntity<EnrollmentResponse> create(@RequestBody @Valid EnrollmentCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.create(request));
    }

    @GetMapping
    @ApiMessage("Lấy danh sách khóa học đã ghi danh thành công")
    ResponseEntity<ApiPagination<EnrollmentResponse>> getMyEnrollments(
            @Filter Specification<Enrollment> spec, Pageable pageable) {
        return ResponseEntity.ok().body(enrollmentService.getMyEnrollments(spec, pageable));
    }
}