package com.education.udemy.repository;

import com.education.udemy.entity.OtpToken;
import com.education.udemy.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {

    Optional<OtpToken> findTopByEmailAndPurposeAndUsedFalseOrderByExpiredAtDesc(
            String email, OtpPurpose purpose);

    Optional<OtpToken> findTopByEmailAndPurposeAndUsedFalseAndExpiredAtAfterOrderByExpiredAtDesc(
            String email, OtpPurpose purpose, LocalDateTime now);

    void deleteAllByEmail(String email);
}