package com.education.udemy.configuration;
import com.education.udemy.entity.Setting;
import com.education.udemy.enums.Provider;
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
                    .username("admin@gmail.com")
                    .name("Đỗ Đức Long")
                    .password(passwordEncoder.encode("Long752004"))
                    .role("ADMIN")
                    .active(true)
                    .provider(Provider.LOCAL)
                    .phone("0969654190")
                    .bio("Quản trị viên hệ thống")
                    .dateOfBirth(LocalDate.of(2004, 5, 7))
                    .build();

            this.userRepository.save(adminUser);
        }

        long countSettings = this.settingRepository.count();
        if (countSettings == 0) {
            Setting defaultSetting = Setting.builder()
                    .siteName("Education Udemy")
                    .siteDescription("Hệ thống quản lý khóa học chuyên nghiệp")
                    .logo("https://res.cloudinary.com/dbn11jpxd/image/upload/v1776353306/udemy/images/lw3yrt2mlv9iqzrmurnz.png")
                    .favicon("https://example.com/favicon.ico")
                    .primaryColor("#981b34")
                    .contactEmail("admin@education.com")
                    .contactPhone("0969654190")
                    .contactAddress("Hà Nội, Việt Nam")
                    .facebookLink("https://www.facebook.com/ouclong.837080")
                    .youtubeLink("https://www.youtube.com/@ouclong5364")
                    .footerText("Bản quyền thuộc về Learnhub")
                    .build();
            this.settingRepository.save(defaultSetting);
        }

        if ( countUsers > 0) {
            System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA...");
        } else
            System.out.println(">>> END INIT DATABASE");
    }

}
