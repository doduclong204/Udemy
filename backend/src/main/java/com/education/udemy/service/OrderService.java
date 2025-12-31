package com.education.udemy.service;

import com.education.udemy.dto.request.order.OrderCreationRequest;
import com.education.udemy.dto.request.order.OrderUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.order.OrderResponse;
import com.education.udemy.entity.Course;
import com.education.udemy.entity.Order;
import com.education.udemy.entity.OrderItem;
import com.education.udemy.entity.User;
import com.education.udemy.enums.OrderStatus;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.OrderMapper;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.OrderRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
import com.opencsv.CSVWriter;
import com.turkraft.springfilter.boot.Filter;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
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

    @Transactional
    public OrderResponse create(OrderCreationRequest request) {
        log.info("Bắt đầu tạo đơn hàng mới");

        // 1. Lấy thông tin User đang đăng nhập từ SecurityContext
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User currentUser = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // 2. Lấy thông tin khóa học từ DB để lấy giá thực tế
        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        if (courses.isEmpty()) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND);
        }

        // 3. Tính toán tổng tiền
        BigDecimal totalAmount = courses.stream()
                .map(Course::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // 4. Tạo thực thể Order và GÁN USER (Giải quyết lỗi null user_id)
        Order order = Order.builder()
                .orderCode("ORD-" + System.currentTimeMillis())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(OrderStatus.PENDING)
                .user(currentUser) // Gán thực thể User vào Order
                .build();

        // 5. Tạo danh sách OrderItems và liên kết với Order
        List<OrderItem> orderItems = courses.stream().map(course ->
                OrderItem.builder()
                        .course(course)
                        .price(course.getPrice())
                        .finalPrice(course.getPrice())
                        .order(order)
                        .build()
        ).toList();

        order.setOrderItems(orderItems);

        // 6. Lưu Order (Cascade sẽ tự động lưu các OrderItem)
        Order savedOrder = orderRepository.save(order);

        log.info("Tạo đơn hàng thành công: {}", savedOrder.getOrderCode());
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
        orderMapper.updateOrder(order, request);
        return orderMapper.toOrderResponse(orderRepository.saveAndFlush(order));
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
             // Sử dụng UTF-8
             OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8)) {

            // 1. Ghi dấu BOM (Byte Order Mark) để Excel không lỗi font tiếng Việt
            out.write(0xef);
            out.write(0xbb);
            out.write(0xbf);

            // 2. Cấu hình CSVWriter
            CSVWriter csvWriter = new CSVWriter(writer,
                    CSVWriter.DEFAULT_SEPARATOR,
                    CSVWriter.DEFAULT_QUOTE_CHARACTER,
                    CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                    CSVWriter.DEFAULT_LINE_END);

            // 3. Viết tiêu đề (Header)
            String[] header = {"Mã đơn hàng", "Khách hàng", "Tổng tiền", "Giảm giá", "Thanh toán", "Trạng thái", "Ngày tạo"};
            csvWriter.writeNext(header);

            // 4. Viết dữ liệu
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
            log.error("Lỗi khi xuất file CSV: ", e);
            throw new AppException(ErrorCode.EXPORT_FAILED);
        }
    }
}