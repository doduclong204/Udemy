package com.education.udemy.controller;

import com.education.udemy.dto.request.review.ReviewRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.review.ReviewResponse;
import com.education.udemy.dto.response.stats.ReviewStatsResponse;
import com.education.udemy.entity.Review;
import com.education.udemy.service.ReviewService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewController {
    ReviewService reviewService;

    @PostMapping
    @ApiMessage("Create review success")
    public ResponseEntity<ReviewResponse> createReview(@RequestBody @Valid ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(request));
    }

    @GetMapping("/stats")
    @ApiMessage("Get review stats success")
    public ResponseEntity<ReviewStatsResponse> getStats() {
        return ResponseEntity.ok(reviewService.getStats());
    }

    @GetMapping
    @ApiMessage("Get all reviews success")
    public ResponseEntity<ApiPagination<ReviewResponse>> getReviews(
            @Filter Specification<Review> spec,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAllReviews(spec, pageable));
    }

    @PutMapping("/{id}")
    @ApiMessage("Update review success")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable String id, @RequestBody @Valid ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete review success")
    public ResponseEntity<ApiString> delete(@PathVariable String id) {
        reviewService.delete(id);
        return ResponseEntity.ok(ApiString.builder().message("success").build());
    }
}