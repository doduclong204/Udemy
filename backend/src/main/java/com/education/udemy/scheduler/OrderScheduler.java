package com.education.udemy.scheduler;

import com.education.udemy.entity.Order;
import com.education.udemy.enums.OrderStatus;
import com.education.udemy.enums.PaymentMethod;
import com.education.udemy.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrderScheduler {

    OrderRepository orderRepository;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cancelExpiredVnpayOrders() {
        Instant cutoff = Instant.now().minus(15, ChronoUnit.MINUTES);

        List<Order> expiredOrders = orderRepository
                .findExpiredVnpayOrders(PaymentMethod.VNPAY, OrderStatus.PENDING, cutoff);

        if (expiredOrders.isEmpty()) return;

        log.info("Cancelling {} expired VNPAY orders", expiredOrders.size());

        expiredOrders.forEach(order -> order.setPaymentStatus(OrderStatus.CANCELLED));
        orderRepository.saveAll(expiredOrders);
    }
}