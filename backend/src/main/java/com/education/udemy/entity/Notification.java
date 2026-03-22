package com.education.udemy.entity;

import com.education.udemy.enums.NotificationStatus;
import com.education.udemy.enums.NotificationTarget;
import com.education.udemy.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "notifications")
@JsonPropertyOrder(alphabetic = true)
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationType type;

    @Column(nullable = false)
    String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    String message;

    @Enumerated(EnumType.STRING)
    NotificationTarget targetType;

    @Enumerated(EnumType.STRING)
    NotificationStatus status;

    String relatedId;
    String relatedCourseId;
    String relatedType;

    @ElementCollection
    @CollectionTable(name = "notification_target_users", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "user_id")
    List<String> targetUserIds;

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL)
    List<UserNotification> userNotifications;
}