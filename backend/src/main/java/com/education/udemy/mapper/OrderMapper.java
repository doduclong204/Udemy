package com.education.udemy.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.education.udemy.dto.request.order.OrderUpdateRequest;
import com.education.udemy.dto.response.order.OrderResponse;
import com.education.udemy.dto.response.order.OrderItemResponse;
import com.education.udemy.entity.Order;
import com.education.udemy.entity.OrderItem;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "courseId", source = "course.id")
    @Mapping(target = "courseName", source = "course.title")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateOrder(@MappingTarget Order order, OrderUpdateRequest request);
}