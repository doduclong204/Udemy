package com.education.udemy.controller;

import com.education.udemy.dto.request.category.CategoryCreationRequest;
import com.education.udemy.dto.request.category.CategoryUpdateRequest;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.category.CategoryResponse;
import com.education.udemy.entity.Category;
import com.education.udemy.service.CategoryService;
import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.util.annotation.ApiMessage;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryController {

    CategoryService categoryService;

    @PostMapping
    @ApiMessage("Create a category success")
    ResponseEntity<CategoryResponse> createCategory(@RequestBody @Valid CategoryCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.categoryService.create(request));
    }

    @GetMapping
    @ApiMessage("Get all categories success")
    ResponseEntity<ApiPagination<CategoryResponse>> getCategories(
            @Filter Specification<Category> spec, Pageable pageable) {
        return ResponseEntity.ok().body(this.categoryService.getAllCategories(spec, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail category success")
    ResponseEntity<CategoryResponse> getCategory(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.categoryService.getDetailCategory(id));
    }

    @GetMapping("/slug/{slug}")
    @ApiMessage("Get category by slug success")
    ResponseEntity<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok().body(this.categoryService.getCategoryBySlug(slug));
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a category success")
    ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable String id,
            @RequestBody @Valid CategoryUpdateRequest request) {
        return ResponseEntity.ok().body(this.categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a category success")
    ResponseEntity<ApiString> delete(@PathVariable String id) {
        categoryService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }
}