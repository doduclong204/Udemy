package com.education.udemy.service;

import com.education.udemy.dto.request.notification.NotificationCreationRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.notification.NotificationResponse;
import com.education.udemy.dto.response.notification.UserNotificationResponse;
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
import java.util.Map;
import java.util.stream.Collectors;

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
    SseService sseService;

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
            List<UserNotification> savedUserNotifications = userNotificationRepository.saveAll(userNotifications);
            pushSseToRecipients(savedUserNotifications, finalNotification);
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
        List<UserNotification> savedUserNotifications = userNotificationRepository.saveAll(userNotifications);
        pushSseToRecipients(savedUserNotifications, notification);

        return getDetail(id);
    }

    private void pushSseToRecipients(List<UserNotification> savedUserNotifications, Notification notification) {
        for (UserNotification un : savedUserNotifications) {
            UserNotificationResponse payload = UserNotificationResponse.builder()
                    .id(un.getId())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .type(notification.getType() != null ? notification.getType().name() : null)
                    .relatedId(notification.getRelatedId())
                    .relatedCourseId(notification.getRelatedCourseId())
                    .relatedType(notification.getRelatedType())
                    .isRead(false)
                    .createdAt(un.getCreatedAt())
                    .build();

            sseService.sendToUser(un.getUser().getUsername(), payload);
        }
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

        Specification<Notification> excludeAnswers = (root, query, cb) -> cb.or(
                cb.isNull(root.get("relatedType")),
                cb.notEqual(root.get("relatedType"), "COURSE_ANSWER")
        );

        Page<Notification> pageNotification = this.notificationRepository
                .findAll(spec == null ? excludeAnswers : spec.and(excludeAnswers), pageable);

        List<String> ids = pageNotification.getContent().stream()
                .map(Notification::getId)
                .toList();

        Map<String, Long> totalSentMap = toMap(
                userNotificationRepository.countGroupByNotificationIdIn(ids));
        Map<String, Long> totalReadMap = toMap(
                userNotificationRepository.countReadGroupByNotificationIdIn(ids));

        List<NotificationResponse> listNotification = pageNotification.getContent().stream()
                .map(noti -> {
                    NotificationResponse res = notificationMapper.toNotificationResponse(noti);
                    res.setTotalSent(totalSentMap.getOrDefault(noti.getId(), 0L));
                    res.setTotalRead(totalReadMap.getOrDefault(noti.getId(), 0L));
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
        List<UserNotification> savedUserNotifications = userNotificationRepository.saveAll(userNotifications);
        pushSseToRecipients(savedUserNotifications, notification);
    }

    private Map<String, Long> toMap(List<Object[]> rows) {
        return rows.stream().collect(Collectors.toMap(
                r -> (String) r[0],
                r -> (Long) r[1]
        ));
    }
}