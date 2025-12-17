package com.education.udemy.repository;

import com.education.udemy.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String>, JpaSpecificationExecutor<Category> {

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, String id);

    Optional<Category> findBySlug(String slug);

    boolean existsByName(@NotBlank(message = "Tên danh mục không được để trống") @Size(max = 30, message = "Tên danh mục không được quá 30 ký tự") String name);

    boolean existsByNameAndIdNot(String newName, String id);
}