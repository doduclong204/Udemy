package com.education.udemy.service;

import com.education.udemy.dto.request.course.CreateCourseRequest;
import com.education.udemy.dto.request.course.UpdateCourseRequest;
import com.education.udemy.dto.request.section.SectionCreationRequest;
import com.education.udemy.dto.request.lecture.LectureCreationRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.course.CourseDetailResponse;
import com.education.udemy.dto.response.course.CourseSummaryResponse;
import com.education.udemy.entity.*;
import com.education.udemy.enums.EnrollmentStatus;
import com.education.udemy.enums.LectureType;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.CourseMapper;
import com.education.udemy.repository.*;
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
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CourseService {

    CourseRepository courseRepository;
    CategoryRepository categoryRepository;
    UserRepository userRepository;
    EnrollmentRepository enrollmentRepository;
    CartItemRepository cartItemRepository;
    WishlistRepository wishlistRepository;
    LectureRepository lectureRepository;
    LectureProgressRepository lectureProgressRepository;
    CourseMapper courseMapper;
    NotificationService notificationService;

    @Transactional
    public CourseDetailResponse create(CreateCourseRequest request) {
        if (courseRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.COURSE_EXISTED);
        }

        Course course = courseMapper.toCourse(request);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        course.setCategory(category);

        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        course.setInstructor(currentUser);

        int totalLectures = 0;
        int totalDuration = 0;

        if (course.getSections() != null) {
            for (var section : course.getSections()) {
                section.setCourse(course);
                if (section.getLectures() != null) {
                    totalLectures += section.getLectures().size();
                    for (var lecture : section.getLectures()) {
                        lecture.setSection(section);
                        if (lecture.getDuration() != null) {
                            totalDuration += lecture.getDuration();
                        }
                    }
                }
            }
        }

        course.setTotalLectures(totalLectures);
        course.setTotalDuration(totalDuration);
        course.setTotalStudents(0);

        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDetailResponse(savedCourse);
    }

    public ApiPagination<CourseSummaryResponse> getAllCourses(Specification<Course> spec, Pageable pageable) {
        Page<Course> pageCourse = courseRepository.findAll(spec, pageable);
        List<CourseSummaryResponse> summaries = pageCourse.getContent().stream()
                .map(courseMapper::toSummaryResponse)
                .toList();

        ApiPagination.Meta meta = new ApiPagination.Meta();
        meta.setCurrent(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageCourse.getTotalPages());
        meta.setTotal(pageCourse.getTotalElements());

        return ApiPagination.<CourseSummaryResponse>builder()
                .meta(meta)
                .result(summaries)
                .build();
    }

    public CourseDetailResponse getDetailCourse(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        CourseDetailResponse response = courseMapper.toDetailResponse(course);

        Optional<String> currentUsername = SecurityUtil.getCurrentUserLogin();
        if (currentUsername.isPresent()) {
            User user = userRepository.findByUsername(currentUsername.get()).orElse(null);
            if (user != null) {
                response.setIsEnrolled(enrollmentRepository.existsByUserIdAndCourseId(user.getId(), id));
                response.setIsInCart(cartItemRepository.existsByCartUserIdAndCourseId(user.getId(), id));
                response.setIsInWishlist(wishlistRepository.existsByUserIdAndCourseId(user.getId(), id));
            }
        } else {
            response.setIsEnrolled(false);
            response.setIsInCart(false);
            response.setIsInWishlist(false);
        }

        return response;
    }

    @Transactional
    public CourseDetailResponse update(String id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        courseMapper.updateCourse(course, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            course.setCategory(category);
        }

        if (request.getSections() != null) {
            mergeSections(course, request.getSections());
        }

        int totalLectures = 0;
        int totalDuration = 0;
        if (course.getSections() != null) {
            for (Section section : course.getSections()) {
                if (section.getLectures() != null) {
                    totalLectures += section.getLectures().size();
                    totalDuration += section.getLectures().stream()
                            .mapToInt(l -> l.getDuration() != null ? l.getDuration() : 0)
                            .sum();
                }
            }
        }
        course.setTotalLectures(totalLectures);
        course.setTotalDuration(totalDuration);

        Course updatedCourse = courseRepository.save(course);

        recalculateProgressForCourse(id);

        try {
            List<User> enrolledUsers = enrollmentRepository.findUsersByCourseId(id);
            if (!enrolledUsers.isEmpty()) {
                notificationService.sendSilentNotification(
                        "Khóa học vừa được cập nhật",
                        "Khóa học \"" + updatedCourse.getTitle() + "\" vừa có nội dung mới. Hãy kiểm tra ngay!",
                        id,
                        id,
                        "COURSE",
                        enrolledUsers
                );
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo cập nhật khóa học: {}", e.getMessage());
        }

        return courseMapper.toDetailResponse(updatedCourse);
    }


    private void mergeSections(Course course, List<SectionCreationRequest> sectionRequests) {
        Map<String, Section> existingSections = course.getSections() == null
                ? new HashMap<>()
                : course.getSections().stream()
                .filter(s -> s.getId() != null)
                .collect(Collectors.toMap(Section::getId, s -> s));

        List<Section> mergedSections = new ArrayList<>();

        for (SectionCreationRequest sReq : sectionRequests) {
            Section section;

            if (sReq.getId() != null && existingSections.containsKey(sReq.getId())) {
                section = existingSections.get(sReq.getId());
                section.setTitle(sReq.getTitle());
            } else {
                section = Section.builder()
                        .title(sReq.getTitle())
                        .course(course)
                        .build();
            }

            if (sReq.getLectures() != null) {
                mergeLectures(section, sReq.getLectures());
            }

            mergedSections.add(section);
        }

        if (course.getSections() == null) {
            course.setSections(mergedSections);
        } else {
            course.getSections().clear();
            course.getSections().addAll(mergedSections);
        }
    }

    private void mergeLectures(Section section, List<LectureCreationRequest> lectureRequests) {
        Map<String, Lecture> existingLectures = section.getLectures() == null
                ? new HashMap<>()
                : section.getLectures().stream()
                .filter(l -> l.getId() != null)
                .collect(Collectors.toMap(Lecture::getId, l -> l));

        List<Lecture> mergedLectures = new ArrayList<>();

        for (LectureCreationRequest lReq : lectureRequests) {
            Lecture lecture;

            if (lReq.getId() != null && existingLectures.containsKey(lReq.getId())) {
                lecture = existingLectures.get(lReq.getId());
                if (lReq.getTitle() != null) lecture.setTitle(lReq.getTitle());
                if (lReq.getType() != null) lecture.setType(lReq.getType());
                if (lReq.getVideoUrl() != null) lecture.setVideoUrl(lReq.getVideoUrl());
                if (lReq.getContent() != null) lecture.setContent(lReq.getContent());
                if (lReq.getDuration() != null) lecture.setDuration(lReq.getDuration());
                if (lReq.getIsFree() != null) lecture.setIsFree(lReq.getIsFree());
            } else {
                // Lecture mới → tạo mới
                lecture = Lecture.builder()
                        .title(lReq.getTitle())
                        .type(lReq.getType())
                        .videoUrl(lReq.getVideoUrl())
                        .content(lReq.getContent())
                        .duration(lReq.getDuration() != null ? lReq.getDuration() : 0)
                        .isFree(lReq.getIsFree() != null ? lReq.getIsFree() : false)
                        .section(section)
                        .build();
            }

            mergedLectures.add(lecture);
        }

        if (section.getLectures() == null) {
            section.setLectures(mergedLectures);
        } else {
            section.getLectures().clear();
            section.getLectures().addAll(mergedLectures);
        }
    }

    private void recalculateProgressForCourse(String courseId) {
        long totalLectures = lectureRepository.countBySectionCourseId(courseId);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        for (Enrollment enrollment : enrollments) {
            if (totalLectures == 0) {
                enrollment.setProgress(BigDecimal.ZERO);
                enrollment.setStatus(EnrollmentStatus.ENROLLED);
            } else {
                long completedCount = lectureProgressRepository
                        .countByEnrollmentIdAndCompletedTrue(enrollment.getId());

                BigDecimal percentage = BigDecimal.valueOf(completedCount)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalLectures), 2, RoundingMode.HALF_UP);

                enrollment.setProgress(percentage);

                if (percentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
                    enrollment.setStatus(EnrollmentStatus.COMPLETED);
                } else if (completedCount > 0) {
                    enrollment.setStatus(EnrollmentStatus.LEARNING);
                } else {
                    enrollment.setStatus(EnrollmentStatus.ENROLLED);
                }
            }
            enrollmentRepository.save(enrollment);
        }
    }

    public void delete(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if ((course.getEnrollments() != null && !course.getEnrollments().isEmpty()) ||
                (course.getReviews() != null && !course.getReviews().isEmpty()) ||
                (course.getOrderItems() != null && !course.getOrderItems().isEmpty())) {
            throw new AppException(ErrorCode.COURSE_HAS_ENROLLMENTS_OR_REVIEWS);
        }

        courseRepository.delete(course);
    }
}