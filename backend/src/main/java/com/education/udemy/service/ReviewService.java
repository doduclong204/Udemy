package com.education.udemy.service;

import com.education.udemy.dto.request.review.ReviewRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.review.ReviewResponse;
import com.education.udemy.dto.response.stats.ReviewStatsResponse;
import com.education.udemy.entity.Course;
import com.education.udemy.entity.Review;
import com.education.udemy.entity.User;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.ReviewMapper;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.ReviewRepository;
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
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewService {
    ReviewRepository reviewRepository;
    ReviewMapper reviewMapper;
    CourseRepository courseRepository;
    UserRepository userRepository;

    private void recalculateCourseRating(Course course) {
        List<Review> activeReviews = reviewRepository.findByCourseAndReviewStatusTrue(course);

        long count = activeReviews.size();
        BigDecimal avg = BigDecimal.ZERO;

        if (count > 0) {
            double sum = activeReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            avg = BigDecimal.valueOf(sum).setScale(2, RoundingMode.HALF_UP);
        }

        course.setRating(avg);
        course.setRatingCount(count);
        courseRepository.save(course);
        log.info("Cập nhật rating course {}: {} ({} đánh giá)", course.getId(), avg, count);
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        log.info("Học viên gửi đánh giá mới");

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        User currentUser = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Review review = reviewMapper.toReview(request);
        review.setCourse(course);
        review.setUser(currentUser);
        review.setReviewStatus(true);

        if (reviewRepository.existsByUserAndCourse(currentUser, course)) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review savedReview = reviewRepository.save(review);

        recalculateCourseRating(course);

        return reviewMapper.toReviewResponse(savedReview);
    }

    public ApiPagination<ReviewResponse> getAllReviews(Specification<Review> spec, Pageable pageable) {
        log.info("Lấy danh sách đánh giá");
        Page<Review> pageReview = reviewRepository.findAll(spec, pageable);

        List<ReviewResponse> list = pageReview.getContent().stream()
                .map(reviewMapper::toReviewResponse).toList();

        return ApiPagination.<ReviewResponse>builder()
                .meta(ApiPagination.Meta.builder()
                        .current(pageable.getPageNumber() + 1)
                        .pageSize(pageable.getPageSize())
                        .pages(pageReview.getTotalPages())
                        .total(pageReview.getTotalElements())
                        .build())
                .result(list)
                .build();
    }

    @Transactional
    public ReviewResponse updateReview(String id, ReviewRequest request) {
        log.info("Cập nhật trạng thái/phản hồi đánh giá");
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        reviewMapper.updateReview(review, request);
        Review updated = reviewRepository.saveAndFlush(review);

        if (request.getReviewStatus() != null) {
            recalculateCourseRating(review.getCourse());
        }

        return reviewMapper.toReviewResponse(updated);
    }

    public ReviewStatsResponse getStats() {
        double avg = safeAvg(reviewRepository.findAverageRating());
        long total = reviewRepository.countByReviewStatusTrue();

        List<Object[]> rows = reviewRepository.countGroupByRating();
        java.util.Map<Integer, Long> distribution = new java.util.LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            distribution.put(star, 0L);
        }
        for (Object[] row : rows) {
            distribution.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }

        return ReviewStatsResponse.builder()
                .avgRating(avg)
                .totalCount(total)
                .distribution(distribution)
                .build();
    }

    private double safeAvg(Double val) {
        return val != null ? Math.round(val * 10.0) / 10.0 : 0.0;
    }

    @Transactional
    public void delete(String id) {
        log.info("Xóa đánh giá");
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        Course course = review.getCourse();
        reviewRepository.deleteById(id);

        recalculateCourseRating(course);
    }
}