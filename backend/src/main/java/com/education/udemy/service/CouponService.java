package com.education.udemy.service;

import com.education.udemy.dto.request.coupon.CouponCreationRequest;
import com.education.udemy.dto.request.coupon.CouponUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.coupon.CouponResponse;
import com.education.udemy.entity.Coupon;
import com.education.udemy.entity.User;
import com.education.udemy.enums.CouponStatus;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.CouponMapper;
import com.education.udemy.repository.CouponRepository;
import com.education.udemy.repository.OrderRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
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
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CouponService {

    CouponRepository couponRepository;
    CouponMapper couponMapper;
    OrderRepository orderRepository;
    UserRepository userRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoExpireCoupons() {
        int count = couponRepository.bulkExpire(Instant.now());
        if (count > 0) {
            log.info("Auto-expired {} coupon(s)", count);
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

    @Transactional(readOnly = true)
    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        validateCoupon(coupon, orderAmount);
        return computeDiscount(coupon, orderAmount);
    }

    @Transactional(readOnly = true)
    public BigDecimal validateAndPreview(String code, BigDecimal orderAmount, String userId) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        validateCoupon(coupon, orderAmount);
        checkUserNotUsed(code, userId);
        return computeDiscount(coupon, orderAmount);
    }

    @Transactional(readOnly = true)
    public BigDecimal validateAndPreviewByEmail(String code, BigDecimal orderAmount) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return validateAndPreview(code, orderAmount, user.getId());
    }

    @Transactional
    public BigDecimal applyAndIncrementCoupon(String code, BigDecimal orderAmount, String userId) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        validateCoupon(coupon, orderAmount);
        checkUserNotUsed(code, userId);

        int updated = couponRepository.incrementUsedCount(code);
        if (updated == 0) {
            throw new AppException(ErrorCode.COUPON_OUT_OF_STOCK);
        }

        couponRepository.markExhaustedIfFull(code);
        log.info("Coupon [{}] applied by user [{}]. usedCount incremented atomically.", code, userId);

        return computeDiscount(coupon, orderAmount);
    }

    @Transactional
    public void incrementCouponUsage(String code) {
        int updated = couponRepository.incrementUsedCount(code);
        if (updated == 0) {
            throw new AppException(ErrorCode.COUPON_OUT_OF_STOCK);
        }
        couponRepository.markExhaustedIfFull(code);
        log.info("Coupon [{}] usage incremented after payment completed.", code);
    }

    private void checkUserNotUsed(String code, String userId) {
        if (userId != null && orderRepository.hasUserUsedCoupon(userId, code)) {
            throw new AppException(ErrorCode.COUPON_ALREADY_USED);
        }
    }

    private void validateCoupon(Coupon coupon, BigDecimal orderAmount) {
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
    }

    private BigDecimal computeDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discountAmount;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = coupon.getDiscountValue();
        }
        return discountAmount.compareTo(orderAmount) > 0 ? orderAmount : discountAmount;
    }
}