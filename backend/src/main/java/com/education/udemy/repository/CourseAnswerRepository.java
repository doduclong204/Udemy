package com.education.udemy.repository;

import com.education.udemy.entity.CourseAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseAnswerRepository extends JpaRepository<CourseAnswer, String>, JpaSpecificationExecutor<CourseAnswer> {

    List<CourseAnswer> findByQuestionIdOrderByCreatedAtAsc(String questionId);
}