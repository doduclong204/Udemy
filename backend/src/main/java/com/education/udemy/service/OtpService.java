package com.education.udemy.service;

import com.education.udemy.entity.OtpToken;
import com.education.udemy.enums.OtpPurpose;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.repository.OtpTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OtpService {

    OtpTokenRepository otpTokenRepository;
    EmailService emailService;
    PasswordEncoder passwordEncoder;

    static int OTP_EXPIRY_MINUTES = 5;
    static int MAX_ATTEMPTS = 5;

    @Transactional
    public void sendOtp(String email, OtpPurpose purpose,
                        String rawPassword, String name, String phone) {
        var existing = otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseAndExpiredAtAfterOrderByExpiredAtDesc(
                        email, purpose, LocalDateTime.now());

        if (existing.isPresent()) {
            emailService.sendOtpEmail(email, existing.get().getOtp(), purpose);
            return;
        }

        otpTokenRepository.deleteAllByEmail(email);

        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .purpose(purpose)
                .expiredAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .attempts(0)
                .tempPassword(rawPassword != null ? passwordEncoder.encode(rawPassword) : null)
                .tempName(name)
                .tempPhone(phone)
                .build();

        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(email, otp, purpose);
        log.info("OTP sent to {} for purpose: {}", email, purpose);
    }

    @Transactional
    public OtpToken verifyOtp(String email, String otp, OtpPurpose purpose) {
        OtpToken otpToken = otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByExpiredAtDesc(email, purpose)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_NOT_FOUND));

        if (otpToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (otpToken.getAttempts() >= MAX_ATTEMPTS) {
            throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS);
        }

        if (!otpToken.getOtp().equals(otp)) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            otpTokenRepository.save(otpToken);
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);
        return otpToken;
    }
}