package com.education.udemy.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           CustomAuthenticationEntryPoint customAuthenticationEntryPoint) throws Exception {

        String[] whileList = {
                "/", "/auth/login", "/auth/refresh", "/auth/register",
                "/auth/register/send-otp",
                "/auth/verify-otp",
                "/auth/forgot-password",
                "/auth/reset-password",
                "/auth/google",
                "/auth/facebook",
                "/auth/stats",
                "/orders/vnpay/return",
                "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                "/storage/**", "/files/**", "/images/**", "/videos/**"
        };
        http
                .csrf(c -> c.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(
                        authz -> authz
                                .requestMatchers("/admin/**").hasAuthority("ADMIN")
                                .requestMatchers("/dashboard/**").hasAuthority("ADMIN")

                                .requestMatchers(HttpMethod.GET, "/products/**")
                                .permitAll()
                                .requestMatchers(HttpMethod.GET,
                                        "/categories/**")
                                .permitAll()
                                .requestMatchers(HttpMethod.GET, "/settings/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/courses/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/tags/**")
                                .permitAll()
                                .requestMatchers(whileList).permitAll()
                                .anyRequest().authenticated())
                .oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults())
                        .authenticationEntryPoint(customAuthenticationEntryPoint))
                .formLogin(f -> f.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

}