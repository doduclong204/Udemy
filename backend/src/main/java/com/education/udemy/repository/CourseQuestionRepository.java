package com.education.udemy.repository;

import com.education.udemy.entity.CourseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseQuestionRepository extends JpaRepository<CourseQuestion, String>, JpaSpecificationExecutor<CourseQuestion> {

    List<CourseQuestion> findByLectureIdOrderByCreatedAtDesc(String lectureId);

    List<CourseQuestion> findByAnsweredFalse();
}