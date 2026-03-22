package com.education.udemy.service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.education.udemy.constant.PredefinedRole;
import com.education.udemy.dto.request.auth.AuthenticationRequest;
import com.education.udemy.dto.request.auth.ForgotPasswordRequest;
import com.education.udemy.dto.request.auth.IntrospectRequest;
import com.education.udemy.dto.request.auth.RegisterRequest;
import com.education.udemy.dto.request.auth.ResetPasswordRequest;
import com.education.udemy.dto.request.auth.VerifyOtpRequest;
import com.education.udemy.dto.request.user.UserCreationRequest;
import com.education.udemy.dto.response.auth.AuthenticationResponse;
import com.education.udemy.dto.response.auth.IntrospectResponse;
import com.education.udemy.dto.response.user.UserResponse;
import com.education.udemy.entity.InvalidatedToken;
import com.education.udemy.entity.OtpToken;
import com.education.udemy.entity.User;
import com.education.udemy.enums.OtpPurpose;
import com.education.udemy.enums.Provider;
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
    OtpService otpService;
    CourseRepository courseRepository;
    OrderRepository orderRepository;
    NotificationService notificationService;

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
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject()
                .authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        AuthenticationResponse res = new AuthenticationResponse();
        User currentUserDB = this.userService.handleGetUserByUsername(request.getUsername());

        if (currentUserDB != null && !currentUserDB.getActive()) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }
        if (currentUserDB != null) {
            res.setUser(this.authMapper.toUserResponse(currentUserDB));
        }

        String access_token = this.securityUtil.createAccessToken(authentication.getName(), res.getUser());
        res.setAccessToken(access_token);

        String refresh_token = this.securityUtil.createRefreshToken(request.getUsername(), res);
        res.setRefreshToken(refresh_token);
        this.userService.updateUserToken(refresh_token, request.getUsername());

        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", refresh_token)
                .httpOnly(false).secure(true).path("/")
                .maxAge(refreshTokenExpiration).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    public ResponseEntity<UserResponse> register(UserCreationRequest request) throws AppException {
        User user = this.userMapper.toUser(request);
        user.setPassword(this.passwordEncoder.encode(request.getPassword()));
        user.setProvider(Provider.LOCAL);
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
        return ResponseEntity.status(HttpStatus.CREATED).body(this.authMapper.toUserResponse(user));
    }

    public ResponseEntity<UserResponse> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get() : "";
        User currentUserDB = this.userService.handleGetUserByUsername(email);
        UserResponse res = this.userMapper.toUserResponse(currentUserDB);
        return ResponseEntity.ok().body(res);
    }

    public ResponseEntity<Void> logout(String authorizationHeader)
            throws AppException, ParseException, JOSEException {
        String username = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get() : "";
        if (username.equals("")) throw new AppException(ErrorCode.INVALID_ACCESSTOKEN);

        User currentUserDB = this.userService.handleGetUserByUsername(username);
        if (currentUserDB != null) this.userService.handleLogout(currentUserDB);

        String token = "";
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
        }

        SignedJWT.parse(token);
        invalidatedTokenRepository.save(InvalidatedToken.builder().accessToken(token).build());

        ResponseCookie deleteSpringCookie = ResponseCookie
                .from("refresh_token", null)
                .httpOnly(true).secure(true).path("/").maxAge(0).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString())
                .body(null);
    }

    public ResponseEntity<AuthenticationResponse> refreshToken(String refresh_token)
            throws AppException, JOSEException, ParseException {
        if (refresh_token.equals("long")) throw new AppException(ErrorCode.COOKIES_EMPTY);

        Jwt decodedToken = this.securityUtil.checkValidRefreshToken(refresh_token);
        verifyToken(refresh_token, true);

        String username = decodedToken.getSubject();
        User currentUser = this.userService.getUserByRefreshTokenAndUsername(refresh_token, username);
        if (currentUser == null) throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        if (!currentUser.getActive()) throw new AppException(ErrorCode.ACCOUNT_LOCKED);

        AuthenticationResponse res = new AuthenticationResponse();
        User currentUserDB = this.userService.handleGetUserByUsername(username);
        if (currentUserDB != null) {
            res = AuthenticationResponse.builder()
                    .user(this.authMapper.toUserResponse(currentUserDB)).build();
        }

        String access_token = this.securityUtil.createAccessToken(username, res.getUser());
        res.setAccessToken(access_token);

        String new_refresh_token = this.securityUtil.createRefreshToken(username, res);
        res.setRefreshToken(new_refresh_token);
        this.userService.updateUserToken(new_refresh_token, username);

        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", new_refresh_token)
                .httpOnly(true).secure(true).path("/").maxAge(refreshTokenExpiration).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    public ResponseEntity<String> sendRegisterOtp(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        otpService.sendOtp(request.getEmail(), OtpPurpose.REGISTER,
                request.getPassword(), request.getName(), request.getPhone());
        return ResponseEntity.ok("OTP sent to " + request.getEmail());
    }

    public ResponseEntity<AuthenticationResponse> verifyRegisterOtp(VerifyOtpRequest request)
            throws JOSEException {
        OtpToken otpToken = otpService.verifyOtp(
                request.getEmail(), request.getOtp(), OtpPurpose.REGISTER);

        User user = User.builder()
                .username(request.getEmail())
                .password(otpToken.getTempPassword())
                .email(request.getEmail())
                .name(otpToken.getTempName())
                .phone(otpToken.getTempPhone())
                .role(PredefinedRole.USER_ROLE)
                .provider(Provider.LOCAL)
                .active(true)
                .build();

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        try {
            notificationService.sendSilentNotification(
                    "Chào mừng bạn đến với Udemy! 🎉",
                    "Tài khoản của bạn đã được tạo thành công. Hãy khám phá các khóa học ngay!",
                    user.getId(),
                    null,
                    "USER",
                    List.of(user)
            );

            List<User> admins = userRepository.findByRole(PredefinedRole.ADMIN_ROLE);
            if (!admins.isEmpty()) {
                notificationService.sendSilentNotification(
                        "Học viên mới đăng ký",
                        "Người dùng " + user.getName() + " (" + user.getEmail() + ") vừa đăng ký tài khoản.",
                        user.getId(),
                        null,
                        "ADMIN_ALERT",
                        admins
                );
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đăng ký user: {}", e.getMessage());
        }

        AuthenticationResponse res = new AuthenticationResponse();
        res.setUser(authMapper.toUserResponse(user));

        String accessToken = securityUtil.createAccessToken(user.getUsername(), res.getUser());
        res.setAccessToken(accessToken);

        String refreshToken = securityUtil.createRefreshToken(user.getUsername(), res);
        res.setRefreshToken(refreshToken);
        userService.updateUserToken(refreshToken, user.getUsername());

        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", refreshToken)
                .httpOnly(false).secure(true).path("/")
                .maxAge(refreshTokenExpiration).build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    public ResponseEntity<String> sendForgotPasswordOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!Provider.LOCAL.equals(user.getProvider())) {
            throw new AppException(ErrorCode.SOCIAL_ACCOUNT_NO_PASSWORD);
        }

        otpService.sendOtp(request.getEmail(), OtpPurpose.FORGOT_PASSWORD, null, null, null);
        return ResponseEntity.ok("OTP sent to " + request.getEmail());
    }

    public ResponseEntity<AuthenticationResponse> resetPassword(ResetPasswordRequest request)
            throws JOSEException {
        otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpPurpose.FORGOT_PASSWORD);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        AuthenticationResponse res = new AuthenticationResponse();
        res.setUser(authMapper.toUserResponse(user));

        String accessToken = securityUtil.createAccessToken(user.getUsername(), res.getUser());
        res.setAccessToken(accessToken);

        String refreshToken = securityUtil.createRefreshToken(user.getUsername(), res);
        res.setRefreshToken(refreshToken);
        userService.updateUserToken(refreshToken, user.getUsername());

        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", refreshToken)
                .httpOnly(false).secure(true).path("/")
                .maxAge(refreshTokenExpiration).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    private SignedJWT verifyToken(String token, boolean isRefresh)
            throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY_REFRESH.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = isRefresh
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                .toInstant().plus(refreshTokenExpiration, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        signedJWT.verify(verifier);
        if (!expiryTime.after(new Date())) throw new AppException(ErrorCode.UNAUTHENTICATED);

        String username = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get() : "";
        if (username.equals("")) throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    public ResponseEntity<Map<String, Object>> getPublicStats() {
        long totalStudents = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalOrders = orderRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("totalOrders", totalOrders);

        return ResponseEntity.ok(stats);
    }
}