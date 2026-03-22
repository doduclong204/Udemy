package com.education.udemy.repository;

import com.education.udemy.entity.Enrollment;
import com.education.udemy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String>, JpaSpecificationExecutor<Enrollment> {

    boolean existsByUserIdAndCourseId(String userId, String courseId);

    @Query("SELECT e.user FROM enrollments e WHERE e.course.id = :courseId")
    List<User> findUsersByCourseId(@Param("courseId") String courseId);
}