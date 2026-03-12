package com.education.udemy.controller;

import com.education.udemy.dto.request.process.ProcessUpdateRequest;
import com.education.udemy.dto.response.process.ProcessResponse;
import com.education.udemy.service.ProcessService;
import com.education.udemy.util.annotation.ApiMessage;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProcessController {

    ProcessService processService;

    @PatchMapping("/{enrollmentId}/progress")
    @ApiMessage("Cập nhật tiến độ học tập thành công")
    public ResponseEntity<ProcessResponse> updateProgress(
            @PathVariable String enrollmentId,
            @RequestBody @Valid ProcessUpdateRequest request) {

        return ResponseEntity.ok().body(processService.updateProgress(enrollmentId, request));
    }

    @GetMapping("/{enrollmentId}/progress")
    @ApiMessage("Lấy tiến độ học tập thành công")
    public ResponseEntity<List<ProcessResponse>> getProgress(
            @PathVariable String enrollmentId) {
        return ResponseEntity.ok().body(processService.getProgressByEnrollment(enrollmentId));
    }
}