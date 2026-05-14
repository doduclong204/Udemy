package com.education.udemy.controller;

import com.education.udemy.dto.request.order.SePayWebhookRequest;
import com.education.udemy.service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders/sepay")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SePayController {

    OrderService orderService;

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(@RequestBody SePayWebhookRequest request) {
        log.info("SePay webhook received: id={}, content='{}', amount={}, type={}",
                request.getId(), request.getContent(),
                request.getTransferAmount(), request.getTransferType());

        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            return ResponseEntity.ok(Map.of("success", "true"));
        }

        try {
            boolean handled = orderService.handleSePayWebhook(request);
            if (handled) {
                log.info("SePay webhook: order completed via content='{}'", request.getContent());
            } else {
                log.warn("SePay webhook: no matching order for content='{}'", request.getContent());
            }
        } catch (Exception e) {
            log.error("SePay webhook error: {}", e.getMessage(), e);
        }

        return ResponseEntity.ok(Map.of("success", "true"));
    }
}