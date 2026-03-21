package com.education.udemy.controller;

import java.text.ParseException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.education.udemy.dto.request.auth.AuthenticationRequest;
import com.education.udemy.dto.request.auth.ForgotPasswordRequest;
import com.education.udemy.dto.request.auth.OAuthRequest;
import com.education.udemy.dto.request.auth.RegisterRequest;
import com.education.udemy.dto.request.auth.ResetPasswordRequest;
import com.education.udemy.dto.request.auth.VerifyOtpRequest;
import com.education.udemy.dto.request.user.UserCreationRequest;
import com.education.udemy.dto.response.auth.AuthenticationResponse;
import com.education.udemy.dto.response.user.UserResponse;
import com.education.udemy.exception.AppException;
import com.education.udemy.service.AuthenticationService;
import com.education.udemy.service.OAuthService;
import com.education.udemy.util.annotation.ApiMessage;
import com.education.udemy.util.annotation.PublicEndpoint;
import com.nimbusds.jose.JOSEException;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;
    OAuthService oAuthService;

    @PublicEndpoint
    @PostMapping("/login")
    @ApiMessage("Login success")
    ResponseEntity<AuthenticationResponse> login(
            @RequestBody AuthenticationRequest request) throws Exception {
        return authenticationService.login(request);
    }

    @PublicEndpoint
    @PostMapping("/register")
    @ApiMessage("Register success")
    ResponseEntity<UserResponse> register(
            @Valid @RequestBody UserCreationRequest request) throws AppException {
        return authenticationService.register(request);
    }

    @GetMapping("/account")
    @ApiMessage("Get account success")
    ResponseEntity<UserResponse> getAccount() {
        return authenticationService.getAccount();
    }

    @PostMapping("/logout")
    @ApiMessage("Logout success")
    ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authorizationHeader)
            throws AppException, ParseException, JOSEException {
        return authenticationService.logout(authorizationHeader);
    }

    @PostMapping("/refresh")
    @ApiMessage("Refresh Token success")
    ResponseEntity<AuthenticationResponse> refreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "long") String refresh_token)
            throws AppException, JOSEException, ParseException {
        return authenticationService.refreshToken(refresh_token);
    }

    @PublicEndpoint
    @PostMapping("/register/send-otp")
    @ApiMessage("OTP sent to email")
    ResponseEntity<String> sendRegisterOtp(
            @Valid @RequestBody RegisterRequest request) {
        return authenticationService.sendRegisterOtp(request);
    }

    @PublicEndpoint
    @PostMapping("/verify-otp")
    @ApiMessage("Register success")
    ResponseEntity<AuthenticationResponse> verifyRegisterOtp(
            @Valid @RequestBody VerifyOtpRequest request) throws JOSEException {
        return authenticationService.verifyRegisterOtp(request);
    }

    @PublicEndpoint
    @PostMapping("/forgot-password")
    @ApiMessage("OTP sent to email")
    ResponseEntity<String> sendForgotPasswordOtp(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return authenticationService.sendForgotPasswordOtp(request);
    }

    @PublicEndpoint
    @PostMapping("/reset-password")
    @ApiMessage("Password reset success")
    ResponseEntity<AuthenticationResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) throws JOSEException {
        return authenticationService.resetPassword(request);
    }

    @PublicEndpoint
    @PostMapping("/google")
    @ApiMessage("Google login success")
    ResponseEntity<AuthenticationResponse> loginGoogle(
            @Valid @RequestBody OAuthRequest request) {
        return oAuthService.loginGoogle(request.getToken());
    }

    @PublicEndpoint
    @PostMapping("/facebook")
    @ApiMessage("Facebook login success")
    ResponseEntity<AuthenticationResponse> loginFacebook(
            @Valid @RequestBody OAuthRequest request) {
        return oAuthService.loginFacebook(request.getToken());
    }
}