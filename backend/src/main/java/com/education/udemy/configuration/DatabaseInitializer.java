package com.education.udemy.configuration;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.education.udemy.entity.User;
import com.education.udemy.repository.UserRepository;

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
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setAddress("hn");
            adminUser.setName("admin");
            adminUser.setPassword(this.passwordEncoder.encode("123456"));
            adminUser.setRole("ADMIN");

            this.userRepository.save(adminUser);
        }

        if ( countUsers > 0) {
            System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA...");
        } else
            System.out.println(">>> END INIT DATABASE");
    }

}
