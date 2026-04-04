package com.education.udemy.configuration;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.service.InvalidatedTokenService;
import com.education.udemy.util.SecurityUtil;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import java.util.List;
import java.util.Map;

@Configuration
public class SecurityJwtConfiguration {

    @Value("${auth.jwt.base64-secret-access}")
    private String accessTokenKey;

    @Value("${auth.jwt.base64-secret-fresh}")
    private String refreshTokenKey;

    @Autowired
    private InvalidatedTokenService invalidatedTokenService;

    @Autowired
    private UserRepository userRepository;

    private SecretKey getSecretKey(String base64Key) {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(base64Key);
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, SecurityUtil.JWT_ALGORITHM.getName());
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey(accessTokenKey)));
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder accessTokenDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey(accessTokenKey))
                .macAlgorithm(SecurityUtil.JWT_ALGORITHM).build();

        NimbusJwtDecoder refreshTokenDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey(refreshTokenKey))
                .macAlgorithm(SecurityUtil.JWT_ALGORITHM).build();

        return token -> {
            try {
                if (invalidatedTokenService.checkToken(token)) {
                    throw new AppException(ErrorCode.UNAUTHENTICATED);
                }

                Jwt jwt = accessTokenDecoder.decode(token);
                if ("refresh".equals(jwt.getClaims().get("token_type"))) {
                    jwt = refreshTokenDecoder.decode(token);
                }

                String username = jwt.getSubject();
                if (username != null) {
                    userRepository.findByUsername(username).ifPresent(user -> {
                        if (!user.getActive()) {
                            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
                        }
                    });
                }

                return jwt;
            } catch (AppException e) {
                throw e;
            } catch (Exception e) {
                System.out.println(">>> JWT error: " + e.getMessage());
                throw e;
            }
        };
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            try {
                // Token structure: { "user": { "id": "...", "username": "...", "role": "ADMIN" } }
                Object userClaim = jwt.getClaims().get("user");
                if (userClaim instanceof Map<?, ?> userMap) {
                    Object role = userMap.get("role");
                    if (role != null) {
                        return List.of(new SimpleGrantedAuthority(role.toString()));
                    }
                }
            } catch (Exception ignored) {}
            return List.of();
        });
        return converter;
    }
}