package com.education.udemy.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import com.education.udemy.entity.LectureNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LectureNoteRepository extends JpaRepository<LectureNote, String> {
    List<LectureNote> findAllByUserIdAndLectureIdOrderByTimeInSecondsAsc(String userId, String lectureId);

    @Modifying
    @Transactional
    void deleteByUserId(String userId);
}