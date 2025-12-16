package com.education.udemy.service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import com.education.udemy.constant.PredefinedRole;
import com.education.udemy.dto.request.AuthenticationRequest;
import com.education.udemy.dto.request.IntrospectRequest;
import com.education.udemy.dto.request.UserCreationRequest;
import com.education.udemy.dto.response.AuthenticationResponse;
import com.education.udemy.dto.response.IntrospectResponse;
import com.education.udemy.dto.response.UserResponse;
import com.education.udemy.entity.InvalidatedToken;
import com.education.udemy.entity.User;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.AuthMapper;
import com.education.udemy.mapper.UserMapper;
import com.education.udemy.repository.InvalidatedTokenRepository;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationService {
    AuthenticationManagerBuilder authenticationManagerBuilder;
    SecurityUtil securityUtil;
    UserService userService;
    PasswordEncoder passwordEncoder;
    AuthMapper authMapper;
    UserMapper userMapper;
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @Value("${auth.jwt.refresh-token-validity-in-seconds}")
    @NonFinal
    long refreshTokenExpiration;

    @Value("${auth.jwt.base64-secret-access}")
    @NonFinal
    String SIGNER_KEY;

    @Value("${auth.jwt.base64-secret-fresh}")
    @NonFinal
    String SIGNER_KEY_REFRESH;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public ResponseEntity<AuthenticationResponse> login(AuthenticationRequest request) throws JOSEException {
        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword());

        // xác thực người dùng => cần viết hàm loadUserByUsername
        Authentication authentication = authenticationManagerBuilder.getObject()
                .authenticate(authenticationToken);

        // save info auth into security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // return api
        AuthenticationResponse res = new AuthenticationResponse();
        User currentUserDB = this.userService.handleGetUserByUsername(request.getUsername());
        if (currentUserDB != null) {
            res.setUser(this.authMapper.toUserResponse(currentUserDB));
        }
        // create a token
        String access_token = this.securityUtil.createAccessToken(authentication.getName(), res.getUser());
        res.setAccessToken(access_token);

        // create refesh token
        String refresh_token = this.securityUtil.createRefreshToken(request.getUsername(), res);
        res.setRefreshToken(refresh_token);
        this.userService.updateUserToken(refresh_token, request.getUsername());

        // set cookies
        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", refresh_token)
                .httpOnly(false)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);

    }

    public ResponseEntity<UserResponse> register(UserCreationRequest request) throws AppException {

        User user = this.userMapper.toUser(request);
        user.setPassword(this.passwordEncoder.encode(request.getPassword()));
        if (request.getRole() == null) {
            request.setRole(PredefinedRole.USER_ROLE);
            user.setRole(PredefinedRole.USER_ROLE);
        } else {
            user.setRole(request.getRole());
        }

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        UserResponse response = this.authMapper.toUserResponse(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public ResponseEntity<UserResponse> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUserDB = this.userService.handleGetUserByUsername(email);
        UserResponse res = this.userMapper.toUserResponse(currentUserDB);
        return ResponseEntity.ok().body(res);
    }

    public ResponseEntity<Void> logout(String authorizationHeader) throws AppException, ParseException, JOSEException {
        String username = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        if (username.equals("")) {
            throw new AppException(ErrorCode.INVALID_ACCESSTOKEN);
        }
        User currentUserDB = this.userService.handleGetUserByUsername(username);
        if (currentUserDB != null) {
            // set refresh token == null
            this.userService.handleLogout(currentUserDB);
        }
        String token = "";
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // Tách token từ chuỗi Bearer Token
            token = authorizationHeader.substring(7);
        }
        SignedJWT signToken = SignedJWT.parse(token);

        InvalidatedToken invalidatedToken = InvalidatedToken.builder().accessToken(token).build();

        invalidatedTokenRepository.save(invalidatedToken);
        // remove refresh_token in cookies
        ResponseCookie deleteSpringCookie = ResponseCookie
                .from("refresh_token", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString())
                .body(null);
    }

    public ResponseEntity<AuthenticationResponse> refreshToken(String refresh_token)
            throws AppException, JOSEException, ParseException {

        // check valid token
        if (refresh_token.equals("duy")) {
            throw new AppException(ErrorCode.COOKIES_EMPTY);
        }
        Jwt decodedToken = this.securityUtil.checkValidRefreshToken(refresh_token);
        var check = verifyToken(refresh_token, true);

        String username = decodedToken.getSubject();

        // check user by token + email ( 2nd layer check)
        User currentUser = this.userService.getUserByRefreshTokenAndUsername(refresh_token, username);
        if (currentUser == null) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // issue new token/set refresh token as cookies
        AuthenticationResponse res = new AuthenticationResponse();
        User currentUserDB = this.userService.handleGetUserByUsername(username);
        if (currentUserDB != null) {
            res = AuthenticationResponse.builder()
                    .user(this.authMapper.toUserResponse(currentUserDB))
                    .build();
        }

        // create a token
        String access_token = this.securityUtil.createAccessToken(username,
                res.getUser());
        res.setAccessToken(access_token);

        // create refesh token
        String new_refresh_token = this.securityUtil.createRefreshToken(username,
                res);
        res.setRefreshToken(new_refresh_token);
        this.userService.updateUserToken(new_refresh_token, username);

        // set cookies
        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", new_refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    private SignedJWT verifyToken(String token, boolean isRefresh)
            throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY_REFRESH.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                        .toInstant().plus(refreshTokenExpiration, ChronoUnit.SECONDS)
                        .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        System.out.println("Token: " + token);
        System.out.println("Signer Key Refresh: " + SIGNER_KEY_REFRESH);
        System.out.println("Algorithm: " + signedJWT.getHeader().getAlgorithm());
        System.out.println("Verified: " + verified);

        if (!(expiryTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        String username = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        if (username.equals("")) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }
}

