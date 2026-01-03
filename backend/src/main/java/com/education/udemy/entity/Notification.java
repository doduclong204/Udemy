package com.education.udemy.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.education.udemy.enums.NotificationStatus;
import com.education.udemy.enums.NotificationTarget;
import com.education.udemy.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "notifications")
@JsonPropertyOrder(alphabetic = true)
public class Notification extends BaseEntity{
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
    String relatedType;

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL)
    List<UserNotification> userNotifications;
}