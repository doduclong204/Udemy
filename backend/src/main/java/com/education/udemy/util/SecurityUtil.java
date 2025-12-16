package com.education.udemy.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import com.education.udemy.dto.response.AuthenticationResponse;
import com.education.udemy.dto.response.UserInToken;
import com.education.udemy.dto.response.UserResponse;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.util.Base64;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityUtil {
    @NonFinal
    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    @Value("${auth.jwt.base64-secret-access}")
    @NonFinal
    private String jwtKey;

    @Value("${auth.jwt.base64-secret-fresh}")
    @NonFinal
    private String jwtKeyRefresh;

    @Value("${auth.jwt.access-token-validity-in-seconds}")
    @NonFinal
    private long accessTokenExpiration;

    @Value("${auth.jwt.refresh-token-validity-in-seconds}")
    @NonFinal
    private long refreshTokenExpiration;

    final JwtEncoder accessTokenEncoder;
    final JwtEncoder refreshTokenEncoder;

    public String createAccessToken(String username, UserResponse dto) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        // user info inside token
        UserInToken user = UserInToken.builder()
                .id(dto.getId())
                .username(username)
                .role(dto.getRole())
                .build();
        // time
        Instant now = Instant.now();
        Instant validity = now.plus(accessTokenExpiration, ChronoUnit.SECONDS);
        // @formatter:off
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
        .subject(username)
        .claim("user", user)
        .issueTime(Date.from(now))
        .expirationTime(Date.from(validity))
        .build();
        SignedJWT signedJWT = new SignedJWT(header, claims);
                // Sign the JWT with the secret key
                MACSigner signer = new MACSigner(java.util.Base64.getDecoder().decode(jwtKey));
                signedJWT.sign(signer);
        
                return signedJWT.serialize();
    }

    

    public String createRefreshToken(String username, AuthenticationResponse dto) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        UserInToken user = UserInToken.builder()
            .id(dto.getUser().getId())
            .username(username)
            .role(dto.getUser().getRole())
            .build();

        Instant now = Instant.now();
        Instant validity = now.plus(refreshTokenExpiration, ChronoUnit.SECONDS);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
            .subject(username)
            .claim("user", user)
            .claim("token_type", "refresh")
            .issueTime(Date.from(now))
            .expirationTime(Date.from(validity))
            .build();

        SignedJWT signedJWT = new SignedJWT(header, claims);

        // Sign the JWT with the secret key
        MACSigner signer = new MACSigner(java.util.Base64.getDecoder().decode(jwtKeyRefresh));
        signedJWT.sign(signer);

        return signedJWT.serialize();
    }


    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(jwtKey).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JWT_ALGORITHM.getName());
    }

    private SecretKey getSecretKeyRefresh() {
        byte[] keyBytes = Base64.from(jwtKeyRefresh).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JWT_ALGORITHM.getName());
    }

    public Jwt checkValidRefreshToken(String token){
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(getSecretKeyRefresh())
                .macAlgorithm(SecurityUtil.JWT_ALGORITHM).build();
                try {
                     return jwtDecoder.decode(token);
                } catch (Exception e) {
                    System.out.println(">>> Refresh token error: " + e.getMessage());
                    throw e;
                }
    }

    public String getUsernameFromRefreshToken(String refreshToken) {
        return (String) Jwts.parser()
                .verifyWith(getRefreshKey())
                .build()
                .parseSignedClaims(refreshToken)
                .getPayload()
                .get("username");
    }

       private SecretKey getRefreshKey() {
        return Keys.hmacShaKeyFor(jwtKeyRefresh.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Get the login of the current user.
     *
     * @return the login of the current user.
     */
    public static Optional<String> getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(extractPrincipal(securityContext.getAuthentication()));
    }

    private static String extractPrincipal(Authentication authentication) {
        if (authentication == null) {
            return null;
        } else if (authentication.getPrincipal() instanceof UserDetails springSecurityUser) {
            return springSecurityUser.getUsername();
        } else if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        } else if (authentication.getPrincipal() instanceof String s) {
            return s;
        }
        return null;
    }

    /**
     * Get the JWT of the current user.
     *
     * @return the JWT of the current user.
     */
    public static Optional<String> getCurrentUserJWT() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(securityContext.getAuthentication())
            .filter(authentication -> authentication.getCredentials() instanceof String)
            .map(authentication -> (String) authentication.getCredentials());
    }

    // public IntrospectResponse introspect(String token) throws JOSEException, ParseException {
    //     boolean isValid = true;
    //     try {
    //         verifyToken(token, false);
    //     } catch (AppException e) {
    //         isValid = false;
    //     }

    //     return IntrospectResponse.builder().valid(isValid).build();
    // }
}
