package com.education.udemy.mapper;

import com.education.udemy.dto.request.coupon.CouponCreationRequest;
import com.education.udemy.dto.request.coupon.CouponUpdateRequest;
import com.education.udemy.dto.response.coupon.CouponResponse;
import com.education.udemy.entity.Coupon;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CouponMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", constant = "0")
    @Mapping(target = "orders", ignore = true)
    Coupon toCoupon(CouponCreationRequest request);

    CouponResponse toCouponResponse(Coupon coupon);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "orders", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateCoupon(@MappingTarget Coupon coupon, CouponUpdateRequest request);
}