package com.education.udemy.service;

import com.education.udemy.dto.request.enrollment.EnrollmentCreationRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.enrollment.EnrollmentResponse;
import com.education.udemy.entity.Course;
import com.education.udemy.entity.Enrollment;
import com.education.udemy.entity.User;
import com.education.udemy.enums.EnrollmentStatus;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.EnrollmentMapper;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.EnrollmentRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EnrollmentService {

    EnrollmentRepository enrollmentRepository;
    EnrollmentMapper enrollmentMapper;
    UserRepository userRepository;
    CourseRepository courseRepository;
    NotificationService notificationService;

    @Transactional
    public EnrollmentResponse create(EnrollmentCreationRequest request) {
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), request.getCourseId())) {
            throw new AppException(ErrorCode.USER_ALREADY_ENROLLED);
        }

        Enrollment enrollment = enrollmentMapper.toEnrollment(request);
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setEnrolledAt(Instant.now());
        enrollment.setProgress(BigDecimal.ZERO);
        enrollment.setStatus(EnrollmentStatus.ENROLLED);

        course.setTotalStudents(
                course.getTotalStudents() == null ? 1 : course.getTotalStudents() + 1
        );
        courseRepository.save(course);

        EnrollmentResponse response = enrollmentMapper.toEnrollmentResponse(enrollmentRepository.save(enrollment));

        try {
            notificationService.sendSilentNotification(
                    "Đăng ký khóa học thành công! 🎉",
                    "Bạn đã đăng ký thành công khóa học \"" + course.getTitle() + "\". Chúc bạn học tốt!",
                    course.getId(),
                    course.getId(),
                    "COURSE",
                    List.of(user)
            );
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đăng ký thành công: {}", e.getMessage());
        }

        return response;
    }

    @Transactional
    public void internalEnroll(User user, String courseId) {
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            return;
        }

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return;

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .enrolledAt(Instant.now())
                .progress(BigDecimal.ZERO)
                .status(EnrollmentStatus.ENROLLED)
                .build();

        enrollmentRepository.save(enrollment);

        course.setTotalStudents(
                course.getTotalStudents() == null ? 1 : course.getTotalStudents() + 1
        );
        courseRepository.save(course);

        try {
            notificationService.sendSilentNotification(
                    "Đăng ký khóa học thành công! 🎉",
                    "Bạn đã đăng ký thành công khóa học \"" + course.getTitle() + "\". Chúc bạn học tốt!",
                    course.getId(),
                    course.getId(),
                    "COURSE",
                    List.of(user)
            );
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo internalEnroll: {}", e.getMessage());
        }
    }

    public ApiPagination<EnrollmentResponse> getMyEnrollments(Specification<Enrollment> spec, Pageable pageable) {
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Specification<Enrollment> belongsToCurrentUser = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("user").get("username"), currentUsername);

        Specification<Enrollment> finalSpec = belongsToCurrentUser.and(spec);

        Page<Enrollment> pageEnrollment = enrollmentRepository.findAll(finalSpec, pageable);

        List<EnrollmentResponse> list = pageEnrollment.getContent().stream()
                .map(enrollmentMapper::toEnrollmentResponse)
                .toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageEnrollment.getTotalPages());
        mt.setTotal(pageEnrollment.getTotalElements());

        return ApiPagination.<EnrollmentResponse>builder()
                .meta(mt)
                .result(list)
                .build();
    }
}