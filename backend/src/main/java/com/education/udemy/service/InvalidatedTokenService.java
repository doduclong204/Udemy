package com.education.udemy.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.education.udemy.repository.InvalidatedTokenRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InvalidatedTokenService {
    InvalidatedTokenRepository invalidatedTokenRepository;

    public boolean checkToken(String token) {
        return this.invalidatedTokenRepository.existsByAccessToken(token);
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void clearToken() {
        this.invalidatedTokenRepository.deleteAll();
    }
}
