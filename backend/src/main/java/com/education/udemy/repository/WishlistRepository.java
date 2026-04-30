package com.education.udemy.repository;

import com.education.udemy.entity.Wishlist;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, String>, JpaSpecificationExecutor<Wishlist> {

    boolean existsByUserIdAndCourseId(String userId, String courseId);

    Optional<Wishlist> findByUserIdAndCourseId(String userId, String courseId);

    void deleteByUserIdAndCourseId(String userId, String courseId);

    @Modifying
    @Transactional
    void deleteByUserId(String userId);
}