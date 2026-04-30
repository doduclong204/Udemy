package com.education.udemy.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import com.education.udemy.entity.Course;
import com.education.udemy.entity.Review;
import com.education.udemy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String>, JpaSpecificationExecutor<Review> {
    List<Review> findByCourseAndReviewStatusTrue(Course course);

    boolean existsByUserAndCourse(User user, Course course);

    @Query("SELECT AVG(r.rating) FROM reviews r")
    Double findAverageRating();

    long countByReviewStatusTrue();

    @Query("SELECT r.rating, COUNT(r) FROM reviews r WHERE r.reviewStatus = true GROUP BY r.rating")
    List<Object[]> countGroupByRating();

    @Modifying
    @Transactional
    void deleteByUserId(String userId);
}