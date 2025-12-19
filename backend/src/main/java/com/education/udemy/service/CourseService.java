package com.education.udemy.service;

import com.education.udemy.dto.request.course.CreateCourseRequest;
import com.education.udemy.dto.request.course.UpdateCourseRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.course.CourseDetailResponse;
import com.education.udemy.dto.response.course.CourseSummaryResponse;
import com.education.udemy.entity.Category;
import com.education.udemy.entity.Course;
import com.education.udemy.entity.User;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.CourseMapper;
import com.education.udemy.repository.CategoryRepository;
import com.education.udemy.repository.CourseRepository;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CourseService {

    CourseRepository courseRepository;
    CategoryRepository categoryRepository;
    UserRepository userRepository;
    CourseMapper courseMapper;

    @Transactional
    public CourseDetailResponse create(CreateCourseRequest request) {
        log.info("Creating a new course: {}", request.getTitle());

        if (courseRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.COURSE_EXISTED);
        }

        Course course = courseMapper.toCourse(request);

        // 1. Set Category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        course.setCategory(category);

        // 2. Set Instructor
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        course.setInstructor(currentUser);

        // 3. Xử lý logic tính toán và gán quan hệ
        int totalLectures = 0;
        int totalDuration = 0;

        if (course.getSections() != null) {
            for (var section : course.getSections()) {
                section.setCourse(course); // Gán cha cho section

                if (section.getLectures() != null) {
                    totalLectures += section.getLectures().size(); // Cộng dồn số bài học

                    for (var lecture : section.getLectures()) {
                        lecture.setSection(section); // Gán cha cho lecture
                        // Cộng dồn thời lượng (nếu có)
                        if (lecture.getDuration() != null) {
                            totalDuration += lecture.getDuration();
                        }
                    }
                }
            }
        }

        // 4. Gán các giá trị tổng vào Entity
        course.setTotalLectures(totalLectures);
        course.setTotalDuration(totalDuration);
        course.setTotalStudents(0); // Mặc định 0 khi mới tạo

        // 5. Lưu và map sang Response
        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDetailResponse(savedCourse);
    }

    public ApiPagination<CourseSummaryResponse> getAllCourses(Specification<Course> spec, Pageable pageable) {
        log.info("Get all courses with filter and pagination");

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
        log.info("Get detail course by id: {}", id);
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        return courseMapper.toDetailResponse(course);
    }

    @Transactional
    public CourseDetailResponse update(String id, UpdateCourseRequest request) {
        log.info("Updating course id: {}", id);

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        // Logic check title duplicate... (giữ nguyên của bạn)

        // Map data mới vào entity cũ
        courseMapper.updateCourse(course, request);

        // Sau khi map update, cần tính toán lại vì số bài học/thời lượng có thể thay đổi
        int totalLectures = 0;
        int totalDuration = 0;

        if (course.getSections() != null) {
            for (var section : course.getSections()) {
                section.setCourse(course);
                if (section.getLectures() != null) {
                    totalLectures += section.getLectures().size();
                    totalDuration += section.getLectures().stream()
                            .mapToInt(l -> l.getDuration() != null ? l.getDuration() : 0)
                            .sum();
                    section.getLectures().forEach(l -> l.setSection(section));
                }
            }
        }

        course.setTotalLectures(totalLectures);
        course.setTotalDuration(totalDuration);

        return courseMapper.toDetailResponse(courseRepository.save(course));
    }

    public void delete(String id) {
        log.info("Delete course id: {}", id);

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        // Kiểm tra ràng buộc: nếu có enrollment, review, orderItem,... thì không cho xóa
        if ((course.getEnrollments() != null && !course.getEnrollments().isEmpty()) ||
                (course.getReviews() != null && !course.getReviews().isEmpty()) ||
                (course.getOrderItems() != null && !course.getOrderItems().isEmpty())) {
            throw new AppException(ErrorCode.COURSE_HAS_ENROLLMENTS_OR_REVIEWS);
        }

        courseRepository.delete(course);
    }
}