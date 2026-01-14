package com.education.udemy.repository;

import com.education.udemy.entity.Enrollment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String>, JpaSpecificationExecutor<Enrollment> {
    boolean existsByUserIdAndCourseId(String userId, String courseId);

}