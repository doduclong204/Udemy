package com.education.udemy.configuration;
import com.education.udemy.entity.Setting;
import com.education.udemy.repository.SettingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.education.udemy.entity.User;
import com.education.udemy.repository.UserRepository;

import java.time.Instant;
import java.time.LocalDate;

@Service
public class DatabaseInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final SettingRepository settingRepository;

    public DatabaseInitializer(
            UserRepository userRepository, PasswordEncoder passwordEncoder, SettingRepository settingRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.settingRepository = settingRepository;
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
                    .active(true)
                    .phone("0969654190")
                    .bio("Quản trị viên hệ thống")
                    .dateOfBirth(LocalDate.of(2004, 5, 7))
                    .build();

            this.userRepository.save(adminUser);
        }

        long countSettings = this.settingRepository.count(); // 3. Kiểm tra setting
        if (countSettings == 0) {
            Setting defaultSetting = Setting.builder()
                    .siteName("Education Udemy")
                    .siteDescription("Hệ thống quản lý khóa học chuyên nghiệp")
                    .logo("https://example.com/logo.png")
                    .favicon("https://example.com/favicon.ico")
                    .primaryColor("#2563eb")
                    .contactEmail("admin@education.com")
                    .contactPhone("0969654190")
                    .contactAddress("Hà Nội, Việt Nam")
                    .facebookLink("#")
                    .youtubeLink("#")
                    .footerText("© 2024 Education Udemy. All rights reserved.")
                    .build();
            this.settingRepository.save(defaultSetting);
        }

        if ( countUsers > 0) {
            System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA...");
        } else
            System.out.println(">>> END INIT DATABASE");
    }

}
