package com.education.udemy.dto.request.notification;

import com.education.udemy.enums.NotificationStatus;
import com.education.udemy.enums.NotificationTarget;
import com.education.udemy.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationCreationRequest {
    @NotNull(message = "Loại thông báo không được để trống")
    NotificationType type;

    @NotBlank(message = "Tiêu đề không được để trống")
    String title;

    @NotBlank(message = "Nội dung không được để trống")
    String message;

    @NotNull(message = "Đối tượng nhận không được để trống")
    NotificationTarget targetType;

    NotificationStatus status;

    String relatedId;
    String relatedType;
}