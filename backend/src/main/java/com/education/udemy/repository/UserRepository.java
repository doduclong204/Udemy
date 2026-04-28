package com.education.udemy.repository;

import java.math.BigDecimal;
import java.security.Provider;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.education.udemy.entity.User;


@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    User findByRefreshTokenAndUsername(String refreshToken, String username);

    List<User> findByRole(String role);

    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderId(Provider provider, String providerId);

    boolean existsByEmail(String email);

    long countByActiveTrue();

    long countByActiveFalse();

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM orders o WHERE o.paymentStatus = 'COMPLETED'")
    BigDecimal sumAllCompletedRevenue();

    @Query("SELECT COUNT(e) FROM enrollments e")
    long countAllEnrollments();
}