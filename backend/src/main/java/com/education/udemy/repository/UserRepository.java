package com.education.udemy.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.education.udemy.entity.User;


@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    User findByRefreshTokenAndUsername(String refreshToken, String username);
}

