package com.education.udemy.service;

import com.education.udemy.dto.request.qa.QARequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.qa.QAResponse;
import com.education.udemy.entity.*;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.QAMapper;
import com.education.udemy.repository.*;
import com.education.udemy.util.SecurityUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class QAService {
    CourseQuestionRepository questionRepository;
    CourseAnswerRepository answerRepository;
    CourseRepository courseRepository;
    LectureRepository lectureRepository;
    UserRepository userRepository;
    NotificationService notificationService;
    QAMapper qaMapper;

    @Transactional
    public QAResponse createQuestion(QARequest request) {
        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Lecture lecture = null;
        if (request.getLectureId() != null) {
            lecture = lectureRepository.findById(request.getLectureId())
                    .orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));
        }

        CourseQuestion question = qaMapper.toQuestion(request);
        question.setUser(currentUser);
        question.setCourse(course);
        question.setLecture(lecture);
        question.setAnswered(false);

        questionRepository.save(question);

        List<User> admins = userRepository.findByRole("ADMIN");
        String lectureTitle = (lecture != null) ? lecture.getTitle() : "Khóa học";

        notificationService.sendSilentNotification(
                "Câu hỏi mới từ học viên",
                "Học viên " + currentUser.getName() + " vừa hỏi tại bài: " + lectureTitle,
                question.getId(),
                "COURSE_QUESTION",
                admins
        );

        return qaMapper.toQuestionResponse(question);
    }

    @Transactional
    public QAResponse createAnswer(QARequest request) {
        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        CourseQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

        CourseAnswer answer = qaMapper.toAnswer(request);
        answer.setUser(currentUser);
        answer.setQuestion(question);

        if (currentUser.getRole().equals("ADMIN") || currentUser.getRole().equals("INSTRUCTOR")) {
            answer.setInstructorAnswer(true);
            question.setAnswered(true);
            questionRepository.save(question);
        }

        answerRepository.save(answer);

        if (Boolean.TRUE.equals(answer.getInstructorAnswer())) {
            notificationService.sendSilentNotification(
                    "Giảng viên đã trả lời",
                    "Thắc mắc của bạn tại bài học đã có phản hồi mới.",
                    question.getId(),
                    "COURSE_ANSWER",
                    List.of(question.getUser())
            );
        }

        return qaMapper.toAnswerResponse(answer);
    }

    public ApiPagination<QAResponse> getAllQuestions(Specification<CourseQuestion> spec, Pageable pageable) {
        Page<CourseQuestion> page = questionRepository.findAll(spec, pageable);
        List<QAResponse> list = page.getContent().stream()
                .map(qaMapper::toQuestionResponse)
                .toList();

        ApiPagination.Meta meta = ApiPagination.Meta.builder()
                .current(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .pages(page.getTotalPages())
                .total(page.getTotalElements())
                .build();

        return ApiPagination.<QAResponse>builder()
                .meta(meta)
                .result(list)
                .build();
    }
}