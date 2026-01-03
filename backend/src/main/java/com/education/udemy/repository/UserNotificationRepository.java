package com.education.udemy.repository;

import com.education.udemy.entity.UserNotification;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, String>, JpaSpecificationExecutor<UserNotification> {
    long countByNotificationId(String notificationId);
    long countByNotificationIdAndIsReadTrue(String notificationId);
    long countByUserIdAndIsReadFalse(String userId);

    @Modifying
    @Transactional
    void deleteByNotificationId(String notificationId);
}