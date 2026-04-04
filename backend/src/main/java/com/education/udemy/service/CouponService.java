package com.education.udemy.service;

import com.education.udemy.dto.request.coupon.CouponCreationRequest;
import com.education.udemy.dto.request.coupon.CouponUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.coupon.CouponResponse;
import com.education.udemy.entity.Coupon;
import com.education.udemy.enums.CouponStatus;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.CouponMapper;
import com.education.udemy.repository.CouponRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CouponService {

    CouponRepository couponRepository;
    CouponMapper couponMapper;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoExpireCoupons() {
        List<Coupon> expiredCoupons = couponRepository.findAll().stream()
                .filter(c -> c.getCouponStatus() == CouponStatus.ACTIVE
                        && c.getExpiresAt() != null
                        && c.getExpiresAt().isBefore(Instant.now()))
                .toList();

        expiredCoupons.forEach(c -> {
            c.setCouponStatus(CouponStatus.EXPIRED);
            log.info("Coupon {} auto-expired", c.getCode());
        });

        if (!expiredCoupons.isEmpty()) {
            couponRepository.saveAll(expiredCoupons);
        }
    }

    public CouponResponse create(CouponCreationRequest request) {
        log.info("Create a new coupon: {}", request.getCode());
        if (couponRepository.existsByCode(request.getCode())) {
            throw new AppException(ErrorCode.COUPON_EXISTED);
        }
        Coupon coupon = couponMapper.toCoupon(request);
        return couponMapper.toCouponResponse(couponRepository.save(coupon));
    }

    public ApiPagination<CouponResponse> getAllCoupons(Specification<Coupon> spec, Pageable pageable) {
        log.info("Get all coupons with pagination");
        Page<Coupon> pageCoupon = couponRepository.findAll(spec, pageable);
        List<CouponResponse> listCoupon = pageCoupon.getContent().stream()
                .map(couponMapper::toCouponResponse)
                .toList();

        ApiPagination.Meta mt = ApiPagination.Meta.builder()
                .current(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .pages(pageCoupon.getTotalPages())
                .total(pageCoupon.getTotalElements())
                .build();

        return ApiPagination.<CouponResponse>builder()
                .meta(mt)
                .result(listCoupon)
                .build();
    }

    public CouponResponse getDetailCoupon(String id) {
        return couponRepository.findById(id)
                .map(couponMapper::toCouponResponse)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
    }

    @Transactional
    public CouponResponse update(String id, CouponUpdateRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        couponMapper.updateCoupon(coupon, request);

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isAfter(Instant.now())) {
            if (coupon.getCouponStatus() == CouponStatus.EXPIRED) {
                coupon.setCouponStatus(CouponStatus.ACTIVE);
            }
        }

        return couponMapper.toCouponResponse(couponRepository.save(coupon));
    }

    public void delete(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        if (coupon.getOrders() != null && !coupon.getOrders().isEmpty()) {
            throw new AppException(ErrorCode.COUPON_HAS_ORDERS);
        }

        couponRepository.delete(coupon);
    }

    public CouponResponse getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .map(couponMapper::toCouponResponse)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
    }

    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        if (coupon.getCouponStatus() == CouponStatus.EXHAUSTED) {
            throw new AppException(ErrorCode.COUPON_OUT_OF_STOCK);
        }

        if (coupon.getCouponStatus() != CouponStatus.ACTIVE) {
            throw new AppException(ErrorCode.COUPON_INACTIVE);
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.COUPON_EXPIRED);
        }

        if (coupon.getMaxUsage() != null && coupon.getUsedCount() >= coupon.getMaxUsage()) {
            throw new AppException(ErrorCode.COUPON_OUT_OF_STOCK);
        }

        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new AppException(ErrorCode.COUPON_MIN_AMOUNT_NOT_REACHED);
        }

        BigDecimal discountAmount;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        return discountAmount.compareTo(orderAmount) > 0 ? orderAmount : discountAmount;
    }

    @Transactional
    public void updateCouponUsage(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        int newUsedCount = (coupon.getUsedCount() == null ? 0 : coupon.getUsedCount()) + 1;
        coupon.setUsedCount(newUsedCount);

        if (coupon.getMaxUsage() != null && newUsedCount >= coupon.getMaxUsage()) {
            coupon.setCouponStatus(CouponStatus.EXHAUSTED);
            log.info("Coupon {} is now EXHAUSTED due to max usage", code);
        }

        couponRepository.save(coupon);
    }
}