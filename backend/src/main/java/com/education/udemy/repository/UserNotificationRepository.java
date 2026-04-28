package com.education.udemy.repository;

import com.education.udemy.entity.UserNotification;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, String>, JpaSpecificationExecutor<UserNotification> {
    long countByNotificationId(String notificationId);
    long countByNotificationIdAndReadTrue(String notificationId);
    long countByUserIdAndReadFalse(String userId);
    long countByReadTrue();

    @Modifying
    @Transactional
    void deleteByNotificationId(String notificationId);

    List<UserNotification> findAllByUserUsernameAndReadFalse(String username);

    @Query("SELECT un.notification.id, COUNT(un) FROM user_notifications un WHERE un.notification.id IN :ids GROUP BY un.notification.id")
    List<Object[]> countGroupByNotificationIdIn(@Param("ids") List<String> ids);

    @Query("SELECT un.notification.id, COUNT(un) FROM user_notifications un WHERE un.notification.id IN :ids AND un.read = true GROUP BY un.notification.id")
    List<Object[]> countReadGroupByNotificationIdIn(@Param("ids") List<String> ids);
}