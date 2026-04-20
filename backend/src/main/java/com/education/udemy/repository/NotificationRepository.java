package com.education.udemy.repository;

import com.education.udemy.entity.Notification;
import com.education.udemy.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String>, JpaSpecificationExecutor<Notification> {

    List<Notification> findByRelatedIdAndRelatedType(String relatedId, String relatedType);

    long countByStatus(NotificationStatus status);

    @Query("SELECT COUNT(n) FROM notifications n WHERE n.status = :status AND (n.relatedType IS NULL OR n.relatedType NOT IN ('COURSE_ANSWER', 'ADMIN_ALERT', 'QUESTION'))")
    long countAdminCreatedByStatus(@Param("status") NotificationStatus status);
}