package com.education.udemy.service;

import com.education.udemy.dto.request.review.ReviewRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.review.ReviewResponse;
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

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        log.info("Học viên gửi đánh giá mới");
        Review review = reviewMapper.toReview(request);
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        review.setCourse(course);

        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        User currentUser = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        review.setUser(currentUser);

        review.setReviewStatus(true);

        Review savedReview = reviewRepository.save(review);

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
        return reviewMapper.toReviewResponse(reviewRepository.saveAndFlush(review));
    }

    public void delete(String id) {
        log.info("Xóa đánh giá");
        if (!reviewRepository.existsById(id))
            throw new AppException(ErrorCode.REVIEW_NOT_FOUND);
        reviewRepository.deleteById(id);
    }
}