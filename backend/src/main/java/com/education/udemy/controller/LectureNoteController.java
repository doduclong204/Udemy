package com.education.udemy.controller;

import com.education.udemy.dto.request.lecture_note.LectureNoteCreationRequest;
import com.education.udemy.dto.request.lecture_note.LectureNoteUpdateRequest;
import com.education.udemy.dto.response.lecture_note.LectureNoteResponse;
import com.education.udemy.service.LectureNoteService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lecture-notes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LectureNoteController {
    LectureNoteService lectureNoteService;

    @PostMapping
    public ResponseEntity<LectureNoteResponse> create(@RequestBody @Valid LectureNoteCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lectureNoteService.create(request));
    }

    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<List<LectureNoteResponse>> getMyNotes(@PathVariable String lectureId) {
        return ResponseEntity.ok(lectureNoteService.getMyNotesByLecture(lectureId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LectureNoteResponse> update(@PathVariable String id, @RequestBody @Valid LectureNoteUpdateRequest request) {
        return ResponseEntity.ok(lectureNoteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        lectureNoteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}