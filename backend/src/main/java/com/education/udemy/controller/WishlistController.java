package com.education.udemy.controller;

import com.education.udemy.dto.request.wishlist.WishlistRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.wishlist.WishlistResponse;
import com.education.udemy.entity.Wishlist;
import com.education.udemy.service.WishlistService;
import com.education.udemy.util.annotation.ApiMessage;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/my-wishlist")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WishlistController {

    WishlistService wishlistService;

    @PostMapping
    @ApiMessage("Add to wishlist success")
    public ResponseEntity<WishlistResponse> addToWishlist(@RequestBody @Valid WishlistRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.wishlistService.create(request));
    }

    @GetMapping
    @ApiMessage("Get my wishlist success")
    public ResponseEntity<ApiPagination<WishlistResponse>> getMyWishlist(
            @Filter Specification<Wishlist> spec, Pageable pageable) {
        return ResponseEntity.ok().body(this.wishlistService.getAllWishlists(spec, pageable));
    }

    @DeleteMapping("/{courseId}")
    @ApiMessage("Remove from wishlist success")
    public ResponseEntity<ApiString> remove(@PathVariable String courseId) {
        this.wishlistService.delete(courseId);
        return ResponseEntity.ok().body(ApiString.builder().message("success").build());
    }
}