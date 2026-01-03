package com.education.udemy.controller;

import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.notification.UserNotificationResponse;
import com.education.udemy.entity.UserNotification;
import com.education.udemy.service.UserNotificationService;
import com.education.udemy.util.annotation.ApiMessage;
import com.turkraft.springfilter.boot.Filter;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user-notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserNotificationController {

    UserNotificationService userNotificationService;

    @GetMapping
    @ApiMessage("Get my notifications success")
    public ResponseEntity<ApiPagination<UserNotificationResponse>> getMyNotifications(
            @Filter Specification<UserNotification> spec, Pageable pageable) {
        return ResponseEntity.ok().body(this.userNotificationService.getMyNotifications(spec, pageable));
    }

    @PatchMapping("/{id}/read")
    @ApiMessage("Mark notification as read success")
    public ResponseEntity<ApiString> markAsRead(@PathVariable String id) {
        this.userNotificationService.markAsRead(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }
}