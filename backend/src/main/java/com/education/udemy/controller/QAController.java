package com.education.udemy.controller;

import com.education.udemy.dto.request.qa.QARequest;
import com.education.udemy.dto.response.qa.QAResponse;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.entity.CourseAnswer;
import com.education.udemy.entity.CourseQuestion;
import com.education.udemy.service.QAService;
import com.education.udemy.util.annotation.ApiMessage;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/qa")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QAController {
    QAService qaService;

    @PostMapping("/questions")
    @ApiMessage("Đặt câu hỏi thành công")
    public ResponseEntity<QAResponse> createQuestion(@RequestBody @Valid QARequest request) {
        return ResponseEntity.ok(qaService.createQuestion(request));
    }

    @PostMapping("/answers")
    @ApiMessage("Trả lời thành công")
    public ResponseEntity<QAResponse> createAnswer(@RequestBody @Valid QARequest request) {
        return ResponseEntity.ok(qaService.createAnswer(request));
    }

    @GetMapping("/questions")
    @ApiMessage("Lấy danh sách câu hỏi thành công")
    public ResponseEntity<ApiPagination<QAResponse>> getQuestions(
            @Filter Specification<CourseQuestion> spec, Pageable pageable) {
        return ResponseEntity.ok(qaService.getAllQuestions(spec, pageable));
    }

    @GetMapping("/answers")
    @ApiMessage("Lấy danh sách câu trả lời thành công")
    public ResponseEntity<ApiPagination<QAResponse>> getAnswers(
            @Filter Specification<CourseAnswer> spec, Pageable pageable) {
        return ResponseEntity.ok(qaService.getAllAnswers(spec, pageable));
    }
}