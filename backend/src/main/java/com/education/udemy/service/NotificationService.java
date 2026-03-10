package com.education.udemy.service;

import com.education.udemy.dto.request.notification.NotificationCreationRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.notification.NotificationResponse;
import com.education.udemy.entity.Notification;
import com.education.udemy.entity.User;
import com.education.udemy.entity.UserNotification;
import com.education.udemy.enums.NotificationStatus;
import com.education.udemy.enums.NotificationType;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.NotificationMapper;
import com.education.udemy.repository.NotificationRepository;
import com.education.udemy.repository.UserNotificationRepository;
import com.education.udemy.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {
    NotificationRepository notificationRepository;
    UserNotificationRepository userNotificationRepository;
    UserRepository userRepository;
    NotificationMapper notificationMapper;

    @Transactional
    public NotificationResponse createNotification(NotificationCreationRequest request) {
        log.info("Tạo thông báo với status: {}", request.getStatus());

        Notification notification = notificationMapper.toNotification(request);

        if (notification.getStatus() == null) {
            notification.setStatus(NotificationStatus.DRAFT);
        }

        notification = notificationRepository.save(notification);

        if (notification.getStatus() == NotificationStatus.SENT) {
            List<User> allUsers = userRepository.findAll();
            Notification finalNotification = notification;
            List<UserNotification> userNotifications = allUsers.stream()
                    .map(user -> UserNotification.builder()
                            .notification(finalNotification)
                            .user(user)
                            .read(false)
                            .build())
                    .toList();
            userNotificationRepository.saveAll(userNotifications);
        }

        return getDetail(notification.getId());
    }

    @Transactional
    public NotificationResponse sendNotification(String id) {
        log.info("Gửi thông báo draft: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (notification.getStatus() != NotificationStatus.DRAFT) {
            throw new AppException(ErrorCode.NOTIFICATION_ALREADY_SENT);
        }

        notification.setStatus(NotificationStatus.SENT);
        notificationRepository.save(notification);

        List<User> allUsers = userRepository.findAll();
        List<UserNotification> userNotifications = allUsers.stream()
                .map(user -> UserNotification.builder()
                        .notification(notification)
                        .user(user)
                        .read(false)
                        .build())
                .toList();
        userNotificationRepository.saveAll(userNotifications);

        return getDetail(id);
    }

    public ApiPagination<NotificationResponse> getAll(Specification<Notification> spec, Pageable pageable) {
        log.info("Get all notifications for admin");
        Page<Notification> pageNotification = this.notificationRepository.findAll(spec, pageable);

        List<NotificationResponse> listNotification = pageNotification.getContent().stream()
                .map(noti -> {
                    NotificationResponse res = notificationMapper.toNotificationResponse(noti);
                    res.setTotalSent(userNotificationRepository.countByNotificationId(noti.getId()));
                    res.setTotalRead(userNotificationRepository.countByNotificationIdAndReadTrue(noti.getId()));
                    return res;
                })
                .toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageNotification.getTotalPages());
        mt.setTotal(pageNotification.getTotalElements());

        return ApiPagination.<NotificationResponse>builder()
                .meta(mt)
                .result(listNotification)
                .build();
    }

    public NotificationResponse getDetail(String id) {
        log.info("Get detail notification");
        Notification noti = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        NotificationResponse res = notificationMapper.toNotificationResponse(noti);
        res.setTotalSent(userNotificationRepository.countByNotificationId(id));
        res.setTotalRead(userNotificationRepository.countByNotificationIdAndReadTrue(id));
        return res;
    }

    @Transactional
    public void delete(String id) {
        log.info("Delete a notification");
        if (!notificationRepository.existsById(id)) {
            throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }

        userNotificationRepository.deleteByNotificationId(id);
        notificationRepository.deleteById(id);
    }
    @Transactional
    public void sendSilentNotification(String title, String message, String relatedId, String relatedType, List<User> recipients) {
        Notification notification = Notification.builder()
                .type(NotificationType.COURSE)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .relatedType(relatedType)
                .status(NotificationStatus.SENT)
                .build();
        notificationRepository.save(notification);

        List<UserNotification> userNotifications = recipients.stream()
                .map(user -> UserNotification.builder()
                        .notification(notification)
                        .user(user)
                        .read(false)
                        .build())
                .toList();
        userNotificationRepository.saveAll(userNotifications);
    }
}