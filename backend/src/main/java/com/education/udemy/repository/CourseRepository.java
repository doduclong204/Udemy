package com.education.udemy.repository;

import com.education.udemy.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String>, JpaSpecificationExecutor<Course> {

    boolean existsByTitle(String title);

    boolean existsByTitleAndIdNot(String title, String id);

    Optional<Course> findById(String id);
}