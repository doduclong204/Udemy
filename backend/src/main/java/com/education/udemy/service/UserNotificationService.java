package com.education.udemy.service;

import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.notification.UserNotificationResponse;
import com.education.udemy.entity.UserNotification;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.NotificationMapper;
import com.education.udemy.repository.UserNotificationRepository;
import com.education.udemy.util.SecurityUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserNotificationService {
    UserNotificationRepository userNotificationRepository;
    NotificationMapper notificationMapper;

    public ApiPagination<UserNotificationResponse> getMyNotifications(Specification<UserNotification> spec, Pageable pageable) {
        log.info("Get my notifications for user");

        // 1. Lấy username từ trường "sub" trong Token (Kết quả là "user" hoặc "admin")
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // 2. Lọc thông báo dựa trên username để tránh lỗi ép kiểu UUID
        Specification<UserNotification> usernameSpec = (root, query, cb) ->
                cb.equal(root.get("user").get("username"), currentUsername);

        // 3. Kết hợp với các filter từ URL (nếu có)
        Specification<UserNotification> combinedSpec = usernameSpec.and(spec);

        Page<UserNotification> pageUserNoti = this.userNotificationRepository.findAll(combinedSpec, pageable);

        List<UserNotificationResponse> listUserNoti = pageUserNoti.getContent().stream()
                .map(notificationMapper::toUserNotificationResponse)
                .toList();

        // 4. Xây dựng Meta data cho Pagination
        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageUserNoti.getTotalPages());
        mt.setTotal(pageUserNoti.getTotalElements());

        return ApiPagination.<UserNotificationResponse>builder()
                .meta(mt)
                .result(listUserNoti)
                .build();
    }

    @Transactional
    public void markAsRead(String id) {
        log.info("Mark notification as read");

        // Lấy thông báo theo ID
        UserNotification userNoti = userNotificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // Kiểm tra bảo mật bằng username để đồng bộ với Token
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Nếu username của người sở hữu thông báo không khớp với người đang gọi API -> Lỗi
        if (!userNoti.getUser().getUsername().equals(currentUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        userNoti.setRead(true);
        userNoti.setReadAt(Instant.now());
        userNotificationRepository.save(userNoti);
    }

    public long getUnreadCount(String userId) {
        return userNotificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}