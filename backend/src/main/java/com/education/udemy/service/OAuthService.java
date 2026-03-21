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
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    @NonFinal
    @Value("${oauth2.google.client-id}")
    String googleClientId;

    RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<AuthenticationResponse> loginGoogle(String idToken) {
        String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

        Map<String, Object> payload;
        try {
            payload = restTemplate.getForObject(verifyUrl, Map.class);
        } catch (Exception e) {
            throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);
        }

        if (payload == null) throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);

        String aud = (String) payload.get("aud");
        if (!googleClientId.equals(aud)) {
            throw new AppException(ErrorCode.OAUTH2_TOKEN_INVALID);
        }

        String email      = (String) payload.get("email");
        String name       = (String) payload.get("name");
        String avatar     = (String) payload.get("picture");
        String providerId = (String) payload.get("sub");

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