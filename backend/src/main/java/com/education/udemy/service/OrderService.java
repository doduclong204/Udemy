package com.education.udemy.service;

import com.education.udemy.dto.request.order.AdminOrderCreationRequest;
import com.education.udemy.dto.request.order.OrderCreationRequest;
import com.education.udemy.dto.request.order.OrderUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.order.OrderResponse;
import com.education.udemy.entity.*;
import com.education.udemy.enums.OrderStatus;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.OrderMapper;
import com.education.udemy.repository.CouponRepository;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.OrderRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
import com.opencsv.CSVWriter;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrderService {

    OrderRepository orderRepository;
    OrderMapper orderMapper;
    CourseRepository courseRepository;
    UserRepository userRepository;
    CouponService couponService;
    CouponRepository couponRepository;
    EnrollmentService enrollmentService;

    @Transactional
    public OrderResponse adminCreate(AdminOrderCreationRequest request) {
        log.info("Admin creating order for userId: {}", request.getUserId());

        User targetUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        if (courses.isEmpty()) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND);
        }

        BigDecimal totalAmount = courses.stream()
                .map(Course::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            appliedCoupon = couponRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
            discountAmount = couponService.calculateDiscount(request.getCouponCode(), totalAmount);
        }
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        Order order = Order.builder()
                .orderCode("ORD-" + System.currentTimeMillis())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(OrderStatus.PENDING)
                .user(targetUser)
                .coupon(appliedCoupon)
                .build();

        List<OrderItem> orderItems = courses.stream().map(course ->
                OrderItem.builder()
                        .course(course)
                        .price(course.getPrice())
                        .finalPrice(course.getPrice())
                        .order(order)
                        .build()
        ).toList();

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            couponService.updateCouponUsage(request.getCouponCode());
        }

        return orderMapper.toOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse create(OrderCreationRequest request) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        User currentUser = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        if (courses.isEmpty()) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND);
        }

        BigDecimal totalAmount = courses.stream()
                .map(Course::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            appliedCoupon = couponRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
            discountAmount = couponService.calculateDiscount(request.getCouponCode(), totalAmount);
        }
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        Order order = Order.builder()
                .orderCode("ORD-" + System.currentTimeMillis())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(OrderStatus.PENDING)
                .user(currentUser)
                .coupon(appliedCoupon)
                .build();

        List<OrderItem> orderItems = courses.stream().map(course ->
                OrderItem.builder()
                        .course(course)
                        .price(course.getPrice())
                        .finalPrice(course.getPrice())
                        .order(order)
                        .build()
        ).toList();

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            couponService.updateCouponUsage(request.getCouponCode());
        }

        return orderMapper.toOrderResponse(savedOrder);
    }

    public OrderResponse getDetail(String id) {
        return orderRepository.findById(id)
                .map(orderMapper::toOrderResponse)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    public ApiPagination<OrderResponse> getAllOrders(Specification<Order> spec, Pageable pageable) {
        Page<Order> pageOrder = this.orderRepository.findAll(spec, pageable);
        List<OrderResponse> listOrder = pageOrder.getContent().stream()
                .map(orderMapper::toOrderResponse)
                .toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageOrder.getTotalPages());
        mt.setTotal(pageOrder.getTotalElements());

        return ApiPagination.<OrderResponse>builder().meta(mt).result(listOrder).build();
    }

    @Transactional
    public OrderResponse update(String id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus oldStatus = order.getPaymentStatus();
        orderMapper.updateOrder(order, request);
        Order savedOrder = orderRepository.saveAndFlush(order);

        if (oldStatus != OrderStatus.COMPLETED && savedOrder.getPaymentStatus() == OrderStatus.COMPLETED) {
            if (savedOrder.getOrderItems() != null) {
                savedOrder.getOrderItems().forEach(item ->
                        enrollmentService.internalEnroll(savedOrder.getUser(), item.getCourse().getId())
                );
            }
        }

        return orderMapper.toOrderResponse(savedOrder);
    }

    public void delete(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        orderRepository.delete(order);
    }

    public byte[] exportOrdersToCsv(Specification<Order> spec) {
        List<Order> orders = orderRepository.findAll(spec);
        List<OrderResponse> responses = orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8)) {

            out.write(0xef);
            out.write(0xbb);
            out.write(0xbf);

            CSVWriter csvWriter = new CSVWriter(writer,
                    CSVWriter.DEFAULT_SEPARATOR,
                    CSVWriter.DEFAULT_QUOTE_CHARACTER,
                    CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                    CSVWriter.DEFAULT_LINE_END);

            String[] header = {"Mã đơn hàng", "Khách hàng", "Tổng tiền", "Giảm giá", "Thanh toán", "Trạng thái", "Ngày tạo"};
            csvWriter.writeNext(header);

            for (OrderResponse res : responses) {
                String[] data = {
                        res.getOrderCode(),
                        res.getCreatedBy(),
                        res.getTotalAmount().toString(),
                        res.getDiscountAmount().toString(),
                        res.getPaymentMethod().toString(),
                        res.getPaymentStatus().toString(),
                        res.getCreatedAt().toString()
                };
                csvWriter.writeNext(data);
            }

            csvWriter.flush();
            writer.flush();
            return out.toByteArray();

        } catch (Exception e) {
            throw new AppException(ErrorCode.EXPORT_FAILED);
        }
    }
}