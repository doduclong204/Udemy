package com.education.udemy.service;

import com.education.udemy.dto.request.lecture_note.LectureNoteCreationRequest;
import com.education.udemy.dto.request.lecture_note.LectureNoteUpdateRequest;
import com.education.udemy.dto.response.lecture_note.LectureNoteResponse;
import com.education.udemy.entity.Lecture;
import com.education.udemy.entity.LectureNote;
import com.education.udemy.entity.User;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.LectureNoteMapper;
import com.education.udemy.repository.LectureNoteRepository;
import com.education.udemy.repository.LectureRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LectureNoteService {

    LectureNoteRepository lectureNoteRepository;
    UserRepository userRepository;
    LectureRepository lectureRepository;
    LectureNoteMapper lectureNoteMapper;

    private User getCurrentUser() {
        String username = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new AppException(ErrorCode.USER_NOT_AUTHENTICATED));
        return userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public LectureNoteResponse create(LectureNoteCreationRequest request) {
        log.info("Creating a lecture note for lecture: {}", request.getLectureId());

        User user = getCurrentUser();
        Lecture lecture = lectureRepository.findById(request.getLectureId()).orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));

        LectureNote note = lectureNoteMapper.toLectureNote(request);
        note.setUser(user);
        note.setLecture(lecture);

        if (lecture.getDuration() != null && request.getTimeInSeconds() > lecture.getDuration())
            throw new AppException(ErrorCode.INVALID_LECTURE_NOTE_TIME);

        return lectureNoteMapper.toLectureNoteResponse(lectureNoteRepository.save(note));
    }

    public List<LectureNoteResponse> getMyNotesByLecture(String lectureId) {
        log.info("Getting notes for lecture: {}", lectureId);
        User user = getCurrentUser();

        return lectureNoteRepository.findAllByUserIdAndLectureIdOrderByTimeInSecondsAsc(user.getId(), lectureId).stream().map(lectureNoteMapper::toLectureNoteResponse).toList();
    }

    @Transactional
    public LectureNoteResponse update(String id, LectureNoteUpdateRequest request) {
        log.info("Updating lecture note: {}", id);
        LectureNote note = lectureNoteRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOTE_NOT_FOUND));
        User user = getCurrentUser();
        if (!note.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.LECTURE_NOTE_NOT_OWNED);
        }
        if (note.getLecture().getDuration() != null && request.getTimeInSeconds() > note.getLecture().getDuration())
            throw new AppException(ErrorCode.INVALID_LECTURE_NOTE_TIME);

        lectureNoteMapper.updateLectureNote(note, request);
        return lectureNoteMapper.toLectureNoteResponse(lectureNoteRepository.save(note));
    }

    public void delete(String id) {
        log.info("Deleting lecture note: {}", id);
        LectureNote note = lectureNoteRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOTE_NOT_FOUND));

        User user = getCurrentUser();
        if (!note.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.LECTURE_NOTE_NOT_OWNED);
        }

        lectureNoteRepository.delete(note);
    }
}