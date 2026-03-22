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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Specification<UserNotification> usernameSpec = (root, query, cb) ->
                cb.equal(root.get("user").get("username"), currentUsername);

        Specification<UserNotification> combinedSpec = usernameSpec.and(spec);
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<UserNotification> pageUserNoti = this.userNotificationRepository.findAll(combinedSpec, sortedPageable);

        List<UserNotificationResponse> listUserNoti = pageUserNoti.getContent().stream()
                .map(notificationMapper::toUserNotificationResponse)
                .toList();

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
        UserNotification userNoti = userNotificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!userNoti.getUser().getUsername().equals(currentUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        userNoti.setRead(true);
        userNoti.setReadAt(Instant.now());
        userNotificationRepository.save(userNoti);
    }

    @Transactional
    public void markAllAsRead() {
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        List<UserNotification> unreadList = userNotificationRepository
                .findAllByUserUsernameAndReadFalse(currentUsername);

        unreadList.forEach(n -> {
            n.setRead(true);
            n.setReadAt(Instant.now());
        });

        userNotificationRepository.saveAll(unreadList);
    }

    @Transactional
    public void deleteNotification(String id) {
        UserNotification userNoti = userNotificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!userNoti.getUser().getUsername().equals(currentUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        userNotificationRepository.delete(userNoti);
    }

    public long getUnreadCount(String userId) {
        return userNotificationRepository.countByUserIdAndReadFalse(userId);
    }
}