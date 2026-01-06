package com.education.udemy.service;

import com.education.udemy.dto.request.wishlist.WishlistRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.wishlist.WishlistResponse;
import com.education.udemy.entity.Course;
import com.education.udemy.entity.User;
import com.education.udemy.entity.Wishlist;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.WishlistMapper;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.repository.WishlistRepository;
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
public class WishlistService {

    WishlistRepository wishlistRepository;
    WishlistMapper wishlistMapper;
    UserRepository userRepository;
    CourseRepository courseRepository;

    @Transactional
    public WishlistResponse create(WishlistRequest request) {
        log.info("Adding course to wishlist");

        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (wishlistRepository.existsByUserIdAndCourseId(user.getId(), request.getCourseId())) {
            throw new AppException(ErrorCode.WISHLIST_EXISTED);
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .course(course)
                .build();

        wishlistRepository.save(wishlist);
        return wishlistMapper.toWishlistResponse(wishlist);
    }

    public ApiPagination<WishlistResponse> getAllWishlists(Specification<Wishlist> spec, Pageable pageable) {
        log.info("Get wishlist with pagination for current user");
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Specification<Wishlist> belongsToCurrentUser = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("user").get("username"), currentUsername);

        Specification<Wishlist> finalSpec = (spec == null)
                ? belongsToCurrentUser
                : spec.and(belongsToCurrentUser);

        Page<Wishlist> pageWishlist = this.wishlistRepository.findAll(finalSpec, pageable);

        List<WishlistResponse> listWishlist = pageWishlist.getContent().stream()
                .map(wishlistMapper::toWishlistResponse)
                .toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageWishlist.getTotalPages());
        mt.setTotal(pageWishlist.getTotalElements());

        return ApiPagination.<WishlistResponse>builder()
                .meta(mt)
                .result(listWishlist)
                .build();
    }

    @Transactional
    public void delete(String courseId) {
        log.info("Delete from wishlist");
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!wishlistRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new AppException(ErrorCode.WISHLIST_NOT_FOUND);
        }

        wishlistRepository.deleteByUserIdAndCourseId(user.getId(), courseId);
    }
}