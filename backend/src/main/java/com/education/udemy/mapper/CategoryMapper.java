package com.education.udemy.mapper;

import org.mapstruct.*;
import com.education.udemy.dto.request.category.CategoryCreationRequest;
import com.education.udemy.dto.request.category.CategoryUpdateRequest;
import com.education.udemy.dto.response.category.CategoryResponse;
import com.education.udemy.entity.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "totalCourses", ignore = true)
    @Mapping(target = "courses", ignore = true)
    Category toCategory(CategoryCreationRequest request);

    @Mapping(target = "totalCourses", expression = "java(category.getTotalCourses() != null ? category.getTotalCourses() : 0)")
    CategoryResponse toCategoryResponse(Category category);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "totalCourses", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "courses", ignore = true)
    void updateCategory(@MappingTarget Category category, CategoryUpdateRequest request);
}