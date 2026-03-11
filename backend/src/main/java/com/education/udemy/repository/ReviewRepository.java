package com.education.udemy.repository;

import com.education.udemy.entity.Course;
import com.education.udemy.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String>, JpaSpecificationExecutor<Review> {
    List<Review> findByCourseAndReviewStatusTrue(Course course);
}