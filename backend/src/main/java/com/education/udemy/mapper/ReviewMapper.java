package com.education.udemy.mapper;

import com.education.udemy.dto.request.review.ReviewRequest;
import com.education.udemy.dto.response.review.ReviewResponse;
import com.education.udemy.entity.Review;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "course", ignore = true)
    Review toReview(ReviewRequest request);

    @Mapping(target = "user.id", source = "user.id")
    @Mapping(target = "user.name", source = "user.name")
    @Mapping(target = "user.avatar", source = "user.avatar")
    @Mapping(target = "course.id", source = "course.id")
    @Mapping(target = "course.title", source = "course.title")
    ReviewResponse toReviewResponse(Review review);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateReview(@MappingTarget Review review, ReviewRequest request);
}