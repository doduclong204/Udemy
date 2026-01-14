package com.education.udemy.repository;

import com.education.udemy.entity.LectureProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LectureProgressRepository extends JpaRepository<LectureProgress, String> {
    Optional<LectureProgress> findByEnrollmentIdAndLectureId(String enrollmentId, String lectureId);

    long countByEnrollmentIdAndCompletedTrue(String enrollmentId);
}
