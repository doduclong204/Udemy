package com.education.udemy.service;

import com.education.udemy.dto.request.notification.NotificationCreationRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.notification.NotificationResponse;
import com.education.udemy.entity.Notification;
import com.education.udemy.entity.User;
import com.education.udemy.entity.UserNotification;
import com.education.udemy.enums.NotificationStatus;
import com.education.udemy.enums.NotificationTarget;
import com.education.udemy.enums.NotificationType;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.NotificationMapper;
import com.education.udemy.repository.CourseQuestionRepository;
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
    CourseQuestionRepository courseQuestionRepository;

    @Transactional
    public NotificationResponse createNotification(NotificationCreationRequest request) {
        log.info("Tạo thông báo với status: {}", request.getStatus());

        Notification notification = notificationMapper.toNotification(request);

        if (notification.getStatus() == null) {
            notification.setStatus(NotificationStatus.DRAFT);
        }

        if (request.getTargetUserIds() != null && !request.getTargetUserIds().isEmpty()) {
            notification.setTargetUserIds(request.getTargetUserIds());
        }

        notification = notificationRepository.save(notification);

        if (notification.getStatus() == NotificationStatus.SENT) {
            List<User> recipients = resolveRecipients(notification);
            Notification finalNotification = notification;
            List<UserNotification> userNotifications = recipients.stream()
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

        List<User> recipients = resolveRecipients(notification);
        List<UserNotification> userNotifications = recipients.stream()
                .map(user -> UserNotification.builder()
                        .notification(notification)
                        .user(user)
                        .read(false)
                        .build())
                .toList();
        userNotificationRepository.saveAll(userNotifications);

        return getDetail(id);
    }

    private List<User> resolveRecipients(Notification notification) {
        if (notification.getTargetType() == NotificationTarget.SPECIFIC_USERS) {
            List<String> ids = notification.getTargetUserIds();
            if (ids == null || ids.isEmpty()) {
                log.warn("SPECIFIC_USERS nhưng targetUserIds rỗng. notificationId={}", notification.getId());
                return List.of();
            }
            return userRepository.findAllById(ids);
        }
        return userRepository.findAll();
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
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if ("QUESTION".equals(notification.getRelatedType()) && notification.getRelatedId() != null) {
            String questionId = notification.getRelatedId();

            List<Notification> answerNotifs = notificationRepository
                    .findByRelatedIdAndRelatedType(questionId, "COURSE_ANSWER");
            answerNotifs.forEach(n -> {
                userNotificationRepository.deleteByNotificationId(n.getId());
                notificationRepository.delete(n);
            });

            courseQuestionRepository.findById(questionId).ifPresent(question -> {
                log.info("Xóa câu hỏi liên quan: {}", question.getId());
                courseQuestionRepository.delete(question);
            });
        }

        userNotificationRepository.deleteByNotificationId(id);
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void sendSilentNotification(String title, String message, String relatedId,
                                       String relatedCourseId, String relatedType, List<User> recipients) {
        NotificationType type = ("USER".equals(relatedType) || "ADMIN_ALERT".equals(relatedType))
                ? NotificationType.SYSTEM
                : NotificationType.COURSE;

        NotificationTarget targetType;
        if ("QUESTION".equals(relatedType) || "COURSE_ANSWER".equals(relatedType)) {
            targetType = NotificationTarget.SPECIFIC_USERS;
        } else if ("USER".equals(relatedType)) {
            targetType = NotificationTarget.NEW_USER;
        } else if ("ADMIN_ALERT".equals(relatedType)) {
            targetType = NotificationTarget.SPECIFIC_USERS;
        } else {
            targetType = recipients.size() == 1
                    ? NotificationTarget.SPECIFIC_USERS
                    : NotificationTarget.ENROLLED;
        }

        Notification notification = Notification.builder()
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .relatedCourseId(relatedCourseId)
                .relatedType(relatedType)
                .targetType(targetType)
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