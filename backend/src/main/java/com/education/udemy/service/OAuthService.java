package com.education.udemy.service;

import com.education.udemy.constant.PredefinedRole;
import com.education.udemy.dto.response.auth.AuthenticationResponse;
import com.education.udemy.entity.User;
import com.education.udemy.enums.Provider;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.AuthMapper;
import com.education.udemy.repository.UserRepository;
import com.education.udemy.util.SecurityUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OAuthService {

    UserRepository userRepository;
    SecurityUtil securityUtil;
    AuthMapper authMapper;
    UserService userService;
    NotificationService notificationService;

    @NonFinal
    @Value("${oauth2.google.client-id}")
    String googleClientId;

    RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<AuthenticationResponse> loginGoogle(String accessToken) {
        String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?access_token=" + accessToken;

        Map<String, Object> tokenInfo;
        try {
            tokenInfo = restTemplate.getForObject(verifyUrl, Map.class);
        } catch (Exception e) {
            throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);
        }

        if (tokenInfo == null) throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        Map<String, Object> userInfo;
        try {
            userInfo = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class
            ).getBody();
        } catch (Exception e) {
            throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);
        }

        if (userInfo == null) throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);

        String email      = (String) userInfo.get("email");
        String name       = (String) userInfo.get("name");
        String avatar     = (String) userInfo.get("picture");
        String providerId = (String) userInfo.get("id");

        return processOAuthUser(email, name, avatar, providerId, Provider.GOOGLE);
    }

    public ResponseEntity<AuthenticationResponse> loginFacebook(String accessToken) {
        String url = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=" + accessToken;

        Map<String, Object> fbUser;
        try {
            fbUser = restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);
        }

        if (fbUser == null) throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);

        String email      = (String) fbUser.get("email");
        String name       = (String) fbUser.get("name");
        String providerId = (String) fbUser.get("id");

        String avatar = null;
        try {
            Map<String, Object> picture = (Map<String, Object>) fbUser.get("picture");
            Map<String, Object> pictureData = (Map<String, Object>) picture.get("data");
            avatar = (String) pictureData.get("url");
        } catch (Exception ignored) {}

        if (email == null) throw new AppException(ErrorCode.OAUTH2_EMAIL_NOT_FOUND);

        return processOAuthUser(email, name, avatar, providerId, Provider.FACEBOOK);
    }

    private ResponseEntity<AuthenticationResponse> processOAuthUser(
            String email, String name, String avatar,
            String providerId, Provider provider) {

        User user = userRepository.findByEmail(email).orElse(null);
        boolean isNewUser = false;

        if (user != null) {
            if (Provider.LOCAL.equals(user.getProvider())) {
                user.setProvider(provider);
                user.setProviderId(providerId);
                if (user.getAvatar() == null) user.setAvatar(avatar);
                userRepository.save(user);
            }
        } else {
            String username = email.split("@")[0] + "_" + provider.name().toLowerCase();
            if (userRepository.existsByUsername(username)) {
                username = username + "_" + System.currentTimeMillis();
            }

            user = User.builder()
                    .email(email)
                    .username(username)
                    .name(name)
                    .avatar(avatar)
                    .provider(provider)
                    .providerId(providerId)
                    .role(PredefinedRole.USER_ROLE)
                    .active(true)
                    .build();
            userRepository.save(user);
            isNewUser = true;
        }

        if (isNewUser) {
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
                log.error("Lỗi khi gửi thông báo đăng ký OAuth: {}", e.getMessage());
            }
        }

        AuthenticationResponse res = new AuthenticationResponse();
        res.setUser(authMapper.toUserResponse(user));

        try {
            String accessToken = securityUtil.createAccessToken(user.getUsername(), res.getUser());
            res.setAccessToken(accessToken);

            String refreshToken = securityUtil.createRefreshToken(user.getUsername(), res);
            res.setRefreshToken(refreshToken);
            userService.updateUserToken(refreshToken, user.getUsername());
        } catch (Exception e) {
            log.error("Error creating token for user {}: {}", user.getUsername(), e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        return ResponseEntity.ok(res);
    }
}