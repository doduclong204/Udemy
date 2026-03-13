package com.education.udemy.controller;

import com.education.udemy.dto.request.notification.NotificationCreationRequest;
import com.education.udemy.dto.response.api.ApiResponse;
import com.education.udemy.dto.response.notification.NotificationResponse;
import com.education.udemy.entity.Notification;
import com.education.udemy.service.NotificationService;
import com.education.udemy.dto.response.api.ApiString;
import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.util.annotation.ApiMessage;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {

    NotificationService notificationService;

    @PostMapping
    @ApiMessage("Create and broadcast notification success")
    public ResponseEntity<NotificationResponse> createNotification(@RequestBody @Valid NotificationCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.notificationService.createNotification(request));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendNotification(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<NotificationResponse>builder()
                .data(notificationService.sendNotification(id))
                .build());
    }

    @GetMapping
    @ApiMessage("Get all notifications history success")
    public ResponseEntity<ApiPagination<NotificationResponse>> getNotifications(
            @Filter Specification<Notification> spec,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok().body(this.notificationService.getAll(spec, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get notification detail success")
    public ResponseEntity<NotificationResponse> getNotification(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.notificationService.getDetail(id));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a notification success")
    public ResponseEntity<ApiString> delete(@PathVariable String id) {
        this.notificationService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }
}