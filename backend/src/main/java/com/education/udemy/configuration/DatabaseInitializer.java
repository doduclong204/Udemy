package com.education.udemy.configuration;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.education.udemy.entity.User;
import com.education.udemy.repository.UserRepository;

import java.time.Instant;

@Service
public class DatabaseInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(
            UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> START INIT DATABASE");
        long countUsers = this.userRepository.count();
        if (countUsers == 0) {
            User adminUser = User.builder()
                    .username("admin")
                    .name("Đỗ Đức Long")
                    .password(passwordEncoder.encode("123456"))
                    .role("ADMIN")
                    .isActive(true)
                    .phone("0969654190")
                    .bio("Quản trị viên hệ thống")
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .createdBy("system")
                    .updatedBy("system")
                    .build();

            this.userRepository.save(adminUser);
        }

        if ( countUsers > 0) {
            System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA...");
        } else
            System.out.println(">>> END INIT DATABASE");
    }

}
