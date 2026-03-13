package com.education.udemy.mapper;

import com.education.udemy.enums.EnrollmentStatus;
import com.education.udemy.enums.OrderStatus;
import org.mapstruct.*;

import com.education.udemy.dto.request.user.UserCreationRequest;
import com.education.udemy.dto.request.user.UserUpdateRequest;
import com.education.udemy.dto.response.user.UserResponse;
import com.education.udemy.entity.User;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", ignore = true)
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @AfterMapping
    default void setComputedFields(@MappingTarget UserResponse.UserResponseBuilder builder, User user) {
        builder.totalSpent(
                user.getOrders() == null ? BigDecimal.ZERO :
                        user.getOrders().stream()
                                .filter(o -> o.getPaymentStatus() == OrderStatus.COMPLETED)
                                .map(o -> o.getFinalAmount())
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
        builder.enrollmentCount(
                user.getEnrollments() == null ? 0 : user.getEnrollments().size()
        );
        builder.completedCount(
                user.getEnrollments() == null ? 0 :
                        (int) user.getEnrollments().stream()
                                .filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED)
                                .count()
        );
    }

    @Mapping(target = "role", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}