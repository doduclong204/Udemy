package com.education.udemy.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.education.udemy.entity.CourseAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseAnswerRepository extends JpaRepository<CourseAnswer, String>, JpaSpecificationExecutor<CourseAnswer> {

    List<CourseAnswer> findByQuestionIdOrderByCreatedAtAsc(String questionId);

    @Modifying
    @Transactional
    @Query("UPDATE course_answers a SET a.user = null WHERE a.user.id = :userId")
    void setUserNullByUserId(@Param("userId") String userId);
}