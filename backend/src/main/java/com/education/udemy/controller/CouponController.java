package com.education.udemy.controller;

import com.education.udemy.dto.request.coupon.CouponCheckRequest;
import com.education.udemy.dto.request.coupon.CouponCreationRequest;
import com.education.udemy.dto.request.coupon.CouponUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.coupon.CouponResponse;
import com.education.udemy.entity.Coupon;
import com.education.udemy.service.CouponService;
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
@RequestMapping("/coupons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CouponController {

    CouponService couponService;

    @PostMapping
    @ApiMessage("Create a coupon success")
    public ResponseEntity<CouponResponse> createCoupon(@RequestBody @Valid CouponCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.create(request));
    }

    @GetMapping
    @ApiMessage("Get all coupons success")
    public ResponseEntity<ApiPagination<CouponResponse>> getCoupons(
            @Filter Specification<Coupon> spec, Pageable pageable) {
        return ResponseEntity.ok(couponService.getAllCoupons(spec, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail coupon success")
    public ResponseEntity<CouponResponse> getCoupon(@PathVariable String id) {
        return ResponseEntity.ok(couponService.getDetailCoupon(id));
    }
    @GetMapping("/by-code/{code}")
    @ApiMessage("Get coupon by code success")
    public ResponseEntity<CouponResponse> getCouponByCode(@PathVariable String code) {
        log.info("REST request to get Coupon by code: {}", code);
        return ResponseEntity.ok(couponService.getCouponByCode(code));
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a coupon success")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable String id,
            @RequestBody @Valid CouponUpdateRequest request) {
        return ResponseEntity.ok(couponService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a coupon success")
    public ResponseEntity<ApiString> delete(@PathVariable String id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiString.builder().message("success").build());
    }


    @PostMapping("/calculate-discount")
    @ApiMessage("Calculate discount amount success")
    public ResponseEntity<java.math.BigDecimal> calculateDiscount(@RequestBody @Valid CouponCheckRequest request) {
        return ResponseEntity.ok(couponService.calculateDiscount(request.getCode(), request.getOrderAmount()));
    }
}