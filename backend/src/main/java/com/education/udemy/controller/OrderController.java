package com.education.udemy.controller;

import com.education.udemy.dto.request.order.OrderCreationRequest;
import com.education.udemy.dto.request.order.OrderUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.order.OrderResponse;
import com.education.udemy.entity.Order;
import com.education.udemy.enums.OrderStatus;
import com.education.udemy.service.OrderService;
import com.education.udemy.util.annotation.ApiMessage;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrderController {

    OrderService orderService;

    @PostMapping
    @ApiMessage("Create order success")
    public ResponseEntity<OrderResponse> create(@RequestBody @Valid OrderCreationRequest request) {
        return ResponseEntity.ok(orderService.create(request));
    }

    @GetMapping
    @ApiMessage("Get orders success")
    public ResponseEntity<ApiPagination<OrderResponse>> getOrders(
            @Filter Specification<Order> spec, Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(spec, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get order detail success")
    public ResponseEntity<OrderResponse> getDetail(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getDetail(id));
    }

    @PutMapping("/{id}")
    @ApiMessage("Update order success")
    public ResponseEntity<OrderResponse> update(@PathVariable String id, @RequestBody OrderUpdateRequest request) {
        return ResponseEntity.ok(orderService.update(id, request));
    }

    // Hoàn tiền
    @PostMapping("/{id}/refund")
    @ApiMessage("Refund order success")
    public ResponseEntity<OrderResponse> refund(@PathVariable String id) {
        OrderUpdateRequest refundRequest = new OrderUpdateRequest();
        refundRequest.setPaymentStatus(OrderStatus.REFUNDED);
        return ResponseEntity.ok(orderService.update(id, refundRequest));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete order success")
    public ResponseEntity<ApiString> delete(@PathVariable String id) {
        orderService.delete(id);
        return ResponseEntity.ok(ApiString.builder().message("success").build());
    }

    @GetMapping("/export")
    @ApiMessage("Export orders success")
    public ResponseEntity<byte[]> export(@Filter Specification<Order> spec) {
        byte[] csvBytes = orderService.exportOrdersToCsv(spec);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders_export.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}