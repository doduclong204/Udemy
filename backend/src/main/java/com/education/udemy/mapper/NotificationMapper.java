package com.education.udemy.mapper;

import com.education.udemy.dto.request.notification.NotificationCreationRequest;
import com.education.udemy.dto.response.notification.NotificationResponse;
import com.education.udemy.dto.response.notification.UserNotificationResponse;
import com.education.udemy.entity.Notification;
import com.education.udemy.entity.UserNotification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    Notification toNotification(NotificationCreationRequest request);

    NotificationResponse toNotificationResponse(Notification notification);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "notification.title")
    @Mapping(target = "message", source = "notification.message")
    @Mapping(target = "type", source = "notification.type")
    @Mapping(target = "relatedId", source = "notification.relatedId")
    @Mapping(target = "relatedType", source = "notification.relatedType")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "isRead", source = "read")
    @Mapping(target = "readAt", source = "readAt")
    UserNotificationResponse toUserNotificationResponse(UserNotification userNotification);
}