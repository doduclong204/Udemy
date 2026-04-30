package com.education.udemy.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import com.education.udemy.entity.Cart;
import com.education.udemy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    Optional<Cart> findByUser(User user);

    @Modifying
    @Transactional
    void deleteByUserId(String userId);
}