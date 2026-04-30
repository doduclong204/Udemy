package com.education.udemy.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.education.udemy.entity.CourseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseQuestionRepository extends JpaRepository<CourseQuestion, String>, JpaSpecificationExecutor<CourseQuestion> {

    List<CourseQuestion> findByLectureIdOrderByCreatedAtDesc(String lectureId);

    List<CourseQuestion> findByAnsweredFalse();

    @Modifying
    @Transactional
    @Query("UPDATE course_questions q SET q.user = null WHERE q.user.id = :userId")
    void setUserNullByUserId(@Param("userId") String userId);
}