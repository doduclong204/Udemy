package com.education.udemy.service;

import com.education.udemy.dto.request.process.ProcessUpdateRequest;
import com.education.udemy.dto.response.process.ProcessResponse;
import com.education.udemy.entity.*;
import com.education.udemy.enums.EnrollmentStatus;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.ProcessMapper;
import com.education.udemy.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProcessService {
    LectureProgressRepository progressRepository;
    EnrollmentRepository enrollmentRepository;
    LectureRepository lectureRepository;
    ProcessMapper processMapper;

    @Transactional
    public ProcessResponse updateProgress(String enrollmentId, ProcessUpdateRequest request) {
        LectureProgress progress = progressRepository
                .findByEnrollmentIdAndLectureId(enrollmentId, request.getLectureId())
                .orElseGet(() -> createNewProgress(enrollmentId, request.getLectureId()));

        boolean wasCompleted = Boolean.TRUE.equals(progress.getCompleted());

        processMapper.updateProcess(progress, request);
        progress.setLastWatchedAt(Instant.now());

        if (Boolean.TRUE.equals(request.getCompleted()) && progress.getCompletedAt() == null) {
            progress.setCompletedAt(Instant.now());
        }

        progress = progressRepository.save(progress);

        if (!wasCompleted && Boolean.TRUE.equals(progress.getCompleted())) {
            updateOverallEnrollmentProgress(enrollmentId);
        }

        return processMapper.toResponse(progress);
    }

    private LectureProgress createNewProgress(String enrollmentId, String lectureId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));

        return LectureProgress.builder()
                .enrollment(enrollment)
                .lecture(lecture)
                .completed(false)
                .watchedDuration(0)
                .build();
    }

    private void updateOverallEnrollmentProgress(String enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));

        long totalLectures = lectureRepository.countBySectionCourseId(enrollment.getCourse().getId());

        if (totalLectures == 0) return;

        long completedCount = progressRepository.countByEnrollmentIdAndCompletedTrue(enrollmentId);

        BigDecimal percentage = BigDecimal.valueOf(completedCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalLectures), 2, RoundingMode.HALF_UP);

        enrollment.setProgress(percentage);

        if (percentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            if (enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(Instant.now());
            }
        } else {
            enrollment.setStatus(EnrollmentStatus.LEARNING);
        }

        enrollmentRepository.save(enrollment);
    }

    public List<ProcessResponse> getProgressByEnrollment(String enrollmentId) {
        return progressRepository.findByEnrollmentId(enrollmentId)
                .stream()
                .map(processMapper::toResponse)
                .toList();
    }
}