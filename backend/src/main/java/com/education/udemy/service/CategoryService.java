package com.education.udemy.service;

import com.education.udemy.dto.request.category.CategoryCreationRequest;
import com.education.udemy.dto.request.category.CategoryUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.category.CategoryResponse;
import com.education.udemy.entity.Category;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.CategoryMapper;
import com.education.udemy.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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
public class CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    private String generateSlug(String name) {
        if (name == null) return "";

        String normalized = java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD);
        String withoutDiacritics = normalized.replaceAll("\\p{M}", ""); // xóa dấu
        return withoutDiacritics.trim()
                .toLowerCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-]", "")
                .replaceAll("-+", "-"); // tránh nhiều dấu gạch nối
    }

    private String ensureUniqueSlug(String slug, String excludeId) {
        String baseSlug = slug;
        int count = 1;
        while (categoryRepository.existsBySlugAndIdNot(slug, excludeId)) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }

    public CategoryResponse create(CategoryCreationRequest request) {
        log.info("Create a category");
        if (categoryRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }
        Category category = this.categoryMapper.toCategory(request);

        String slug = generateSlug(request.getName());
        slug = ensureUniqueSlug(slug, null);
        category.setSlug(slug);

        try {
            category = categoryRepository.save(category);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        return categoryMapper.toCategoryResponse(category);
    }

    public ApiPagination<CategoryResponse> getAllCategories(Specification<Category> spec, Pageable pageable) {
        log.info("Get all categories");
        Page<Category> pageCategory = this.categoryRepository.findAll(spec, pageable);
        List<CategoryResponse> listCategory = pageCategory.getContent().stream()
                .map(categoryMapper::toCategoryResponse)
                .toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageCategory.getTotalPages());
        mt.setTotal(pageCategory.getTotalElements());

        return ApiPagination.<CategoryResponse>builder()
                .meta(mt)
                .result(listCategory)
                .build();
    }

    public CategoryResponse getDetailCategory(String id) {
        log.info("Get detail a category");
        return categoryMapper.toCategoryResponse(
                categoryRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)));
    }

    public CategoryResponse getCategoryBySlug(String slug) {
        log.info("Get category by slug");
        return categoryMapper.toCategoryResponse(
                categoryRepository.findBySlug(slug)
                        .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)));
    }

    @Transactional
    public CategoryResponse update(String id, CategoryUpdateRequest request) {
        log.info("Update a category");
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        String oldName = category.getName();
        String newName = request.getName();

        if (newName != null && !newName.isBlank() && !newName.equals(oldName)) {
            if (categoryRepository.existsByNameAndIdNot(newName, id)) {
                throw new AppException(ErrorCode.CATEGORY_EXISTED);
            }

            String newSlug = generateSlug(newName);
            newSlug = ensureUniqueSlug(newSlug, id);
            category.setSlug(newSlug);
        }

        categoryMapper.updateCategory(category, request);

        return categoryMapper.toCategoryResponse(categoryRepository.saveAndFlush(category));
    }

    public void delete(String id) {
        log.info("Delete a category");
        Category category = this.categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (category.getCourses() != null && !category.getCourses().isEmpty()) {
            throw new AppException(ErrorCode.CATEGORY_HAS_COURSES);
        }

        this.categoryRepository.delete(category);
    }
}